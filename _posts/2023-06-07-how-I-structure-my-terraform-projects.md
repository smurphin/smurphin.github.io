---
layout: post
title:  "How I structure my Terraform projects"
date:   2023-06-07
categories: terraform
#author: John Doe
---
Harnessing the power of Terraform, we segment resources and utilize environment-specific `tfvars` for a nimble, scalable, and collaborative infrastructure management experience.

## Scaling Your Terraform Projects: A Structured Approach

As cloud practitioners, we should always strive for scalability, reusability, maintainability and probably some other ilities, not just in our infrastructure, but also in our Infrastructure as Code (IaC) projects. One of the many benefits of using a tool like Terraform is that it allows for creating and managing resources in a structured and organized way. In this post, I'll explain my approach to scaling Terraform projects by breaking resources into separate files and managing different environments with distinct `tfvars` files.

### Breaking Resources Into Separate Files

When it comes to managing resources in Terraform, one of the best practices I adhere to is separating similar resources into distinct files. This not only keeps your codebase organized but also enhances readability and maintainability.

Instead of having a monolithic `main.tf` file containing all resources, I prefer to split them up. For instance, all EC2 related resources could go into `ec2.tf` or even a file per service, VPC related resources into `vpc.tf`, and so forth. This means, anyone who looks at the project structure can immediately identify where specific resource configurations reside.

### Leveraging tfvars for Environment Specific Configurations

The power of Terraform does not end at organizing resources. With `tfvars` files, Terraform offers a way to manage environment-specific configurations. Each environment (like development, staging, production) can have its own `tfvars` file, for example, `dev.tfvars`, `staging.tfvars`, and `prod.tfvars`. These files hold the variable values specific to their respective environments.  I like to keep these in separate folders specifying the environment and avoiding any potential conflicts of having them in the root directory.

When executing Terraform code, you can specify which `tfvars` file to use with the `-var-file` flag, like so:

```bash
terraform apply -var-file=dev.tfvars

```

This allows the same Terraform codebase to be used across multiple environments while preserving the specific configurations each environment needs.

### Example Directory structure

An example of how this may look is shown below

![centered](/assets/images/terraform_structure_example.png)

### Benefits

This approach to structuring Terraform projects has numerous benefits:

- **Scalability**: As your infrastructure grows, your Terraform codebase can scale without becoming cluttered or difficult to navigate.

- **Maintainability**: It's easier to update or debug your configuration when resources are separated into logical files.

- **Reusability**: By parameterizing your configurations with variables and utilizing `tfvars` files for different environments, the same codebase can be reused across multiple contexts, reducing duplication and potential errors.

- **Collaboration**: It's easier for team members to understand, navigate, and collaborate on a codebase that is well-structured and organized.

In conclusion, taking the time to thoughtfully structure your Terraform projects in a scalable and organized manner will pay off in the long run as your infrastructure evolves and grows. It's an investment that will save you time and effort in the future, and make your infrastructure management tasks more efficient and less error-prone.

Take a look at how I set up a centralised state file to further help with collaboration [here]({{ site.baseurl }}{% post_url 2023-04-17-Terraform-S3-backend %})