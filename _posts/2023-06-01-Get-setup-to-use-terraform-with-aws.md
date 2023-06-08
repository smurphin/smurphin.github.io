---
layout: post
title:  "Getting setup to use Terraform to manage AWS resources"
date:   2023-06-01
categories: terraform
#author: John Doe
---
A short post describing how to configure an IAM role for Terraform to interact with AWS.

## Creating an IAM role

Best practice is to have a dedicated AWS user with an access key and secret that Terraform can use to manage your AWS resources, this user should be limited to only configure the resources it needs to.

For the purpose of this post, I'll configure a user that will have access to networking and S3 functions, as I need my code to manage different resources I can add the permissions I need.  The user won't have console access or a password, so will only be able to interact via the AWS CLI (using Terraform in our case) with an access key and secret, which will be stored securely away from the rest of the code.

### Create the user

Firstly log in to the console of your [AWS account](https://us-east-1.console.aws.amazon.com/iamv2/home?region=eu-west-1#/home){:target="_blank"} with a user that has the rights to create new users and browse to the IAM service.

Once in the Identity and Access Management (IAM) console, click users on the left and click the "Add users" button on the top right corner

On the next screen enter a username, in the example below I've used `smurphin-terraform`.  Leave the "Provide access to the console" checkbox unticked

![centered](/assets/images/iam_role/create_iam_role_1.png)

Click "Next"

The next screen is where you define the permissions you want to give to the user, if you don't have any groups configured here, click "Create group" and configure a group that has access to the resources you'd like to configure. There is excellent documentation for IAM from AWS [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html){:target="_blank"}

In the example below I'm selecting my previously created groups for `Networking` and `S3` 

![centered](/assets/images/iam_role/create_iam_role_2.png)

Click "Next"

The next page is simply an opportunity to review and then create the user.

![centered](/assets/images/iam_role/create_iam_role_3.png)

If you're happy with how it looks, click "Create user"

You'll then get confirmation that the user is created and see the new user in the IAM console.

![centered](/assets/images/iam_role/create_iam_role_4.png)

## Create the access keys

Now we need to create an access key and secret for the user.  Click on the user name, you'll see the details of that user and the permissions that are granted via the group(s)

![centered](/assets/images/iam_role/create_iam_role_5.png)

Click on the "Security credentials" tab

About halfway down you'll see the Access keys section

![centered](/assets/images/iam_role/create_iam_role_6.png)

click "Create access key"

Select the "Application running outside AWS" option which makes the most sense for this use case, take note of the best practice guidance.

![centered](/assets/images/iam_role/create_iam_role_7.png)

click "Next"

Add a tag if you wish

![centered](/assets/images/iam_role/create_iam_role_8.png)

click "Create access key"

You'll receive confirmation that the access key has been created, copy the access key and secret access key and store them somewhere safe

![centered](/assets/images/iam_role/create_iam_role_9.png)

click "Done"

## Configure your client

We've now got all we need to authorise Terraform to interact with AWS.  I'm not going to cover how to install Terraform for your particular operating system here, there are plenty of guides out there and the Hashicorp docs are great to get Terraform installed, check them out [here](https://developer.hashicorp.com/terraform/downloads){:target="_blank"}

If running Linux or MacOS you can export the keys in your terminal environment so they are valid for as long as your terminal session is active using the following

```bash
 export AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXX
 export AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

```
**Putting a space in front of the command will hide it from your bash history**{: .important-statement}

**Remember to update with your own credentials**{: .important-statement}

For windows you can use a similar concept from a command prompt

```bash
SET AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXX
SET AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

```

you can also set these values within your Terraform code, but this is bad practice and increases the risk of accidently sharing the keys.

## Configure Terraform

Lastly we need to tell Terraform to use the AWS provider.  In our `main.tf` file we need to add the following

```hcl
terraform {
  required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 4.0"
    }
  }
}

provider "aws" {
 region = eu-west-1

}

```

**The region is hard coded as eu-west-1 in this example, update for your region, or check out some of my other posts to see how I use a variable for different environments**{: .important-statement}

Once you have this, you just need to initialise the directory to run terraform using `terraform init`

```bash
terraform init

```

![centered](/assets/images/iam_role/create_iam_role_10.png)

And that's it, you're all good to start managing infrastructure on AWS with Terraform!

Check out some of my other posts to see how I configure my backend to store the state file centrally in AWS s3 [here]({{ site.baseurl }}{% post_url 2023-04-17-Terraform-S3-backend %}) some cool Infrastructure management examples we can now do such as creating a basic VPC with networking [here]({{ site.baseurl }}{% post_url 2023-06-08-Basic-AWS-Networking-with-Terraform %})

Happy Terraforming!












