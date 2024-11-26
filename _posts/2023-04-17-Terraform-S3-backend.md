---
layout: post
title: Configure Terraform to use an S3 backend
date: 2023-04-17T00:00:00.000Z
categories: Terraform AWS
short_title: S3 backend with Terraform
tags:
  - AWS
  - S3
  - IaC
  - Infrastructure
  - Terraform
---
Using S3 to store the Terraform state file allows multiple people in a team to work on the same Infra without risking the state file getting out of sync, it’s also really easy to set up.

<!-- toc -->

- [How to configure](#how-to-configure)
- [How to migrate an existing local state file to S3](#how-to-migrate-an-existing-local-state-file-to-s3)
- [How to switch between state files for different environments](#how-to-switch-between-state-files-for-different-environments)

<!-- tocstop -->

For the purpose of this post I’ll just be running Terraform from my local machine and setting AWS credentials for my session, check out [this]({{ site.baseurl }}{% post_url 2023-06-01-Get-setup-to-use-terraform-with-aws %})
 post for more details on how I set that up.

## How to configure

```bash
 export AWS_ACCESS_KEY_ID=your_access_key_here
 export AWS_SECRET_ACCESS_KEY=your_secret_key_here

```
Note: Adding a space in front of the EXPORT statement keeps the command out of your Bash history

Now that you’ve authenticated to AWS, you need to tell Terraform to use a remote S3 backend.  Edit your `main.tf` file as shown:

```hcl
terraform {
# configure the backend for remote state file storage
  backend "s3" {}
  
  required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 4.0" #dependant on what version you wish to use, check for latest version
    }
  }
}

```
you will then need to configure an `env.tfbackend` file in your environment folder with the following details, similar to this [example](https://github.com/smurphin/aws-terraform-networking/blob/main/environments/eu-west-1/dev.tfbackend){:target="_blank"}

```hcl
bucket = "NameOfBucket" #Enter the name of the S3 bucket you will use
key = "NameOfStateFile" #Enter the name you would like to save the state file as
region = "REGION" #Enter the region where your bucket is
```

keeping your backend config in the environment folder allows the same code to be used for different environments as detailed [here]({{ site.baseurl }}{% post_url 2023-06-07-how-I-structure-my-terraform-projects %})

Note: The S3 bucket must already exist in the AWS account and must have a globally unique name

Now you’re ready to initialise Terraform and have it ready to store state in a central S3 bucket.

```hcl
terraform init -backend-config=path_to_backend_file.tfbackend

```

![Terminal output](/assets/images/terraform_terminal_1.png)

And that’s it, now when you make any changes to your Terraform config, the state will be synced to a central S3 bucket.

## How to migrate an existing local state file to S3

What if you already have a state file on your local machine while you've been testing your code and now you need to store it locally for others to collaborate?

This is where the `-migrate-state ` option will help you out.

Configure the backend statement as above, but this time and the `-migrate-state `option at the end of the init command.

```hcl
terraform init -migrate-state

```

Terraform will detect the backend change and you'll receive a prompt about migrating the state file to the S3 bucket, enter yes when prompted and you'll receive something like the below;

```
Initializing the backend...
Backend configuration changed!

Terraform has detected that the configuration specified for the backend
has changed. Terraform will now check for existing state in the backends.

Terraform detected that the backend type changed from "remote" to "s3".
Do you want to copy existing state to the new backend?
  Pre-existing state was found while migrating the previous "remote" backend to the
  newly configured "s3" backend. No existing state was found in the newly
  configured "s3" backend. Do you want to copy this state to the new "s3"
  backend? Enter "yes" to copy and "no" to start with an empty state.

  Enter a value: yes

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.
```

## How to switch between state files for different environments

When working with multiple environments (like development, staging, and production), you'll need to manage separate state files for each. Here's how you can do that effectively.  Ensure you have a folder setup that supports different environments as detailed [here]({{ site.baseurl }}{% post_url 2023-06-07-how-I-structure-my-terraform-projects %})


Use the `-reconfigure` flag:

*   When switching between environments, use the terraform init -reconfigure -backend-config=<path_to_backend_file.tfbackend> command. This tells Terraform to reinitialize the backend with the new configuration without prompting for state migration. For example:

```bash
terraform init -backend-config=path_to_backend_file.tfbackend -reconfigure

```

This will use the config in the `env.tfbackend` file to switch the state file, allowing you to reuse your code across multiple environments.


I hope this is helpful! Please let me know if you have any feedback or questions. 😊

