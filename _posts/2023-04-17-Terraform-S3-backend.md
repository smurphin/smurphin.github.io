---
layout: post
title:  "Configure Terraform to use an S3 backend"
date:   2023-04-17
categories: terraform azure AI OpenAI InfraAsCode IaC
---

Using S3 to store the Terraform state file allows multiple people in a team to work on the same Infra without risking the state file getting out of sync, it’s also really easy to set up.

For the purpose of this post I’ll just be running Terraform from my local machine and setting AWS credentials for my session, but it’s more secure (and flexible) to use an AWS IAM role and for your CI tool to assume that role.
```
 export AWS_ACCESS_KEY_ID=your_access_key_here
 export AWS_SECRET_ACCESS_KEY=your_secret_key_here
```
Note: Adding a space in front of the EXPORT statement keeps the command out of your Bash history

Now that you’re ready to authenticate to AWS, you can configure a backend.tf file in your Terraform repo with the following details

```
terraform {
  backend "s3" {
    bucket       = "terraform-state-smurphin"
    key          = "aws-networking"
    region       = "eu-west-1"
  }
}
```
Note: The bucket must already exist in the AWS account and must have a globally unique name

Now you’re ready to initialise Terraform and have it ready to store state in a central S3 bucket.

![Terminal output](/assets/images/terminal_output1.png)

And that’s it, now when you make any changes to your Terraform config, the state will be synced to a central S3 bucket.

I’ll add an example in here later on what to do if you’ve already been running with local state files.