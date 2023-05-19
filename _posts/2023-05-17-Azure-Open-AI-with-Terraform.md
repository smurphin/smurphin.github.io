---
layout: post
title:  "Automating Azure OpenAI Deployments with Terraform"
date:   2023-05-17
categories: terraform azure AI OpenAI InfraAsCode IaC
#author: John Doe
---
# {{ page.title }}
In this blog post, I'll explore an efficient way to deploy multiple Azure OpenAI instances with multiple models using Terraform. Azure OpenAI provides powerful artificial intelligence capabilities, including natural language processing and machine learning models.

- [{{ page.title }}](#-pagetitle-)
  * [Introduction to Azure OpenAI](#introduction-to-azure-openai)
    + [Azure OpenAI vs. OpenAI: What's the Difference?](#azure-openai-vs-openai-whats-the-difference)
  * [The Challenge: Deploying Multiple Models to Multiple Cognitive Accounts](#the-challenge-deploying-multiple-models-to-multiple-cognitive-accounts)
  * [The Solution: Nesting Loops with Terraform and Locals](#the-solution-nesting-loops-with-terraform-and-locals)
  * [Project Structure](#project-structure)
    + [main.tf](#maintf)
    + [variables.tf](#variablestf)
    + [dev.tfvars](#devtfvars)
    + [locals.tf](#localstf)
  * [resource-group.tf](#resource-grouptf)
  * [dev-gpt-deployment.tf](#dev-gpt-deploymenttf)
    + [azurerm_cognitive_account Resource Block](#azurerm_cognitive_account-resource-block)
    + [azurerm_cognitive_deployment Resource Block](#azurerm_cognitive_deployment-resource-block)
  * [Conclusion](#conclusion)

## [Introduction to Azure OpenAI](#introduction-to-azure-openai)
Azure OpenAI is a cloud-based service offered by Microsoft Azure that enables developers and data scientists to build and deploy cutting-edge artificial intelligence models. It provides a wide range of AI capabilities, including natural language understanding, sentiment analysis, text translation, image recognition, and more. Azure OpenAI leverages advanced machine learning algorithms to enable sophisticated AI-driven applications and solutions.

### [Azure OpenAI vs. OpenAI: What's the Difference?](#azure-openai-vs-openai-whats-the-difference)
While both Azure OpenAI and OpenAI are related to artificial intelligence, they serve different purposes. OpenAI is an independent research organization focused on developing advanced AI models and technologies. On the other hand, Azure OpenAI is a cloud service provided by Microsoft Azure that integrates OpenAI's models and technologies into the Azure ecosystem. Azure OpenAI enables users to leverage OpenAI's models easily and integrate them into their own applications and workflows within the Azure cloud environment.

## [The Challenge: Deploying Multiple Models to Multiple Cognitive Accounts](#the-challenge-deploying-multiple-models-to-multiple-cognitive-accounts)

For a recent hackathon I had a requirement to deploy multiple Azure OpenAI cognitive accounts, with all of the available deployment models available.  Due to demand current Microsoft restrictions restrict how many cognitive AI deployments can be made per tenant, as well as API rate limits per deployment.

We decided to deploy the maximum number of deployments possible (3 per region at time of writing) Manually creating and configuring each cognitive account and deployment model individually through the Azure portal GUI was a tedious and error-prone process.

In addition there are different models available in different regions, GPT-4 is only available in the US region for example, so it couldn't be just a simple copy / paste or loop exercise.

Similarly, defining multiple resource blocks in Terraform for each cognitive deployment account was not an ideal solution either. It would result in repetitive code and decreased maintainability.

I needed a better way to automate this process.

## [The Solution: Nesting Loops with Terraform and Locals](#the-solution-nesting-loops-with-terraform-and-locals)

To overcome these challenges, I leveraged the power of Terraform and its ability to nest loops using locals. By defining a nested loop structure, I was able to create a clean and efficient solution.

Before diving into the code, it's important to note that this blog post assumes you have some basic knowledge of Azure and Terraform. I won't cover authenticating or connecting to your tenant. If you're new to Azure or Terraform, don't worry! The [Azure provider documentation](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/azure-build) from HashiCorp provides a step-by-step guide on getting started with Azure and Terraform.

## [Project Structure](#project-structure)

To keep my Terraform project organized and modular, I divided it into multiple files. Here's an overview of the project structure:

- [main.tf](#maintf): Contains the main Terraform configuration and provider settings.
- [variables.tf](#variablestf): Declares the variables used in the project, including the deployment configurations.
- [dev.tfvars](#devtfvars): Environment-specific variables file for the development environment.
- [locals.tf](#localstf): Defines the local values and logic for generating the cognitive deployments.
- [resource-group.tf](#resource-grouptf): Defines and manages the Azure resource group where the cognitive accounts and deployments will be organized and managed.
- [gpt-deployment.tf](#gpt-deploymenttf): Defines the configuration for deployment of Azure cognitive accounts and OpenAI models within the accounts.

Let's take a closer look at the key Terraform configuration files in the project.

### [main.tf](#maintf)

In this file, I defined the Azure provider and its required version. I also configured additional provider features as needed. Here's a snippet of the `main.tf` file:

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.54.0"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}
```

### [variables.tf](#variablestf)

The `variables.tf` file defines the variables used throughout the project. It includes variables for the environment, subscription, resource group, deployments, allowed subnets, and model versions. Here's a snippet of the `variables.tf` file:

```hcl
variable "env" {}

variable "subscription" {}

variable "resource-group" {}

variable "deployments" {
  type = map(object({
    location = string
    models  = list(string)
  }))
}

variable "allowed-subnets" {
  default = []
  type    = list(string)
}

variable "model_versions" {
  default = {
    "gpt-35-turbo"     = "0301"
    "code-davinci-002" = "1"
    "gpt-4"            = "0314"
  }
  type = map(string)
}
```

In the `variables.tf` file, the variables are defined using the following format:

```hcl
variable "<variable_name>" {
  type        = <variable_type>
  default     = <default_value>
}
```

- `<variable_name>`: This is the name of the variable you define. It should be unique within the file.
- `<variable_type>` (optional): It specifies the type of the variable, such as string, number, list, or map. If not specified, the variable type will be inferred based on the assigned value or the default value.
- `<default_value>` (optional): It represents the default value assigned to the variable if no other value is provided. If not specified, the variable is considered as required and must be provided during execution.

**If a variable does not have a default value defined, it means it is mandatory and must be passed to the Terraform command either directly on the command line or through a `.tfvars` file.**{: .important-statement}

### [dev.tfvars](#devtfvars)

The `dev.tfvars` file is a Terraform variable file tailored for the specific environment. It contains the values assigned to variables used in the Terraform configuration to customize and configure the infrastructure deployment for that environment.

This file is written in plain text and follows the Terraform variable syntax. It allows you to specify values for variables defined in your Terraform configuration without modifying the actual code. By separating variable values into an external file, you can easily manage different environments and reuse the same Terraform codebase with different configurations.

Here's a snippet of the `dev.tfvars` file:

```hcl
env = "dev"

subscription = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"

resource-group = "DEV-GPT"

deployments = {
  "dev-gpt-EU-a" = {
    location = "westeurope"
    models  = ["gpt-35-turbo", "code-davinci-002"]
  },

  "dev-gpt-US-a" = {
    location = "eastus"
    models  = ["gpt-35-turbo", "gpt-4"]
  }
}

allowed-subnets = [
  "189.31.106.126",
]
```

This is where the environment specific values for the variables defined in `variables.tf` are set, allowing us to use the same code for different environments.

To use the `dev.tfvars` file, you can pass it to the Terraform command line using the `-var-file` option. 
For example:
```bash
terraform apply -var-file=dev.tfvars
```

### [locals.tf](#localstf)

The `locals.tf` file plays a crucial role in generating the cognitive deployments dynamically. It allows you to define local values and logic that can be used within your Terraform configuration. Let's dive into a detailed explanation of the `locals.tf` file.

```hcl
locals {
  cognitive_deployments = flatten([
    for deployment, values in var.deployments : [
      for model in values.models : {
        deployment_name        = deployment
        cognitive_account_id  = azurerm_cognitive_account.gpt-act[deployment].id
        model_name            = model
        version               = var.model_versions[model]
      }
    ]
  ])
}
```

The `cognitive_deployments` local value is defined as a flattened list generated using a nested for loop. This loop iterates over each deployment specified in the `var.deployments` variable, which contains the deployment configurations for each instance.

For each deployment, another nested for loop is used to iterate over the models specified in the `values.models` list. This loop generates a map for each model within the deployment.

 Within each map, the following values are assigned:
 - `deployment_name`: The name of the deployment, which is set as the current deployment being iterated.
 - `cognitive_account_id`: The Azure Cognitive Account ID, which is fetched using the `azurerm_cognitive_account.gpt-act[deployment].id` expression. This retrieves the ID of the corresponding cognitive account based on the deployment name.
 - `model_name`: The name of the model, which is set as the current model being iterated.
 - `version`: The version of the model, which is fetched from the `var.model_versions` variable using the `var.model_versions[model]` expression. This retrieves the version based on the model name.

The `cognitive_deployments` local value is generated as a flattened list, combining all the maps generated for each deployment and model

This results in a list of maps, where each map represents a specific cognitive deployment.

You can use the `cognitive_deployments` local value in other parts of your Terraform configuration to reference the dynamically generated deployment configurations.

## [resource-group.tf](#resource-grouptf)

The `resource-group.tf` file contains the definition of the Azure Resource Group resource using the `azurerm_resource_group` Terraform provider. This serves as a logical container for the related resources. It ensures that all the cognitive accounts and deployments associated with the project are organized and managed within the specified resource group, providing better resource management, access control, and overall organization of resources in the Azure environment.

```hcl
resource "azurerm_resource_group" "gpt-rg" {
    location = "westeurope" #Note: cognitive accounts can be deployed in different regions
    #this is just where the resource group exists
    name     = "${var.env}-GPT"
    tags     = {}

    timeouts {}
}
```

Explanation of the resource block:

- `azurerm_resource_group`: Specifies the Azure Resource Group resource type using the `azurerm_resource_group` provider.
- `"gpt-rg"`: Sets the resource name for referencing purposes within the Terraform configuration.
- `location = "westeurope"`: Specifies the Azure region where the resource group will be created.
- `name = "${var.env}-GPT"`: Sets the name of the resource group. The name is constructed using the value of the `var.env` variable, and then the `"GPT"` suffix. This allows for dynamic naming based on the environment specified in the variables.
- `tags = {}`: Specifies any tags that should be associated with the resource group. In this case, an empty set of tags is provided, but you can customize it as per your requirements.
- `timeouts {}`: Specifies the timeout configuration for resource operations. In this case, the default timeout values are used.

## [gpt-deployment.tf](#gpt-deploymenttf)

The core deployment resources are defined in the `gpt-deployment.tf` file. This file includes the `azurerm_cognitive_account` and `azurerm_cognitive_deployment` resource blocks. Here's a snippet of the `gpt-deployment.tf` file:

```hcl
resource "azurerm_cognitive_account" "gpt-act" {
    for_each = var.deployments
    custom_subdomain_name              = each.key
    dynamic_throttling_enabled         = false
    kind                               = "OpenAI"
    local_auth_enabled                 = true
    location                           = each.value.location
    name                               = each.key
    outbound_network_access_restricted = false
    public_network_access_enabled      = true
    resource_group_name                = azurerm_resource_group.gpt-rg.name
    sku_name                           = "S0"
    tags                               = {}

    network_acls {
        default_action = "Deny"
        ip_rules       = var.allowed-subnets
    }

    timeouts {}

}

resource "azurerm_cognitive_deployment" "gpt-deployment" {
  for_each = { for idx, dep in local.cognitive_deployments : idx => dep }

  cognitive_account_id = each.value.cognitive_account_id
  name                 = each.value.model_name

  model {
    format  = "OpenAI"
    name    = each.value.model_name
    version = each.value.version
  }

  scale {
    type = "Standard"
  }

  timeouts {}
}

```

### [azurerm_cognitive_account Resource Block](#azurerm_cognitive_account-resource-block)

The `azurerm_cognitive_account` resource block provisions a cognitive account in Azure for the GPT project. It uses the `for_each` meta-argument to iterate over the `var.deployments` variable, which contains a map of deployment configurations for different regions or environments.

- `for_each`: Iterates over the `var.deployments` map to create a cognitive account for each deployment.
- `custom_subdomain_name`: Specifies the custom subdomain name for the cognitive account i.e `dev-gpt-EU-a`.
- `dynamic_throttling_enabled`: Determines if dynamic throttling is enabled for the cognitive account.
- `kind`: Specifies the kind of cognitive service, which is set to "OpenAI" in this case.
- `local_auth_enabled`: Indicates whether local authentication is enabled.
- `location`: Specifies the location for the cognitive account, obtained from `each.value.location` i.e `westeurope`.
- `name`: Sets the name of the cognitive account to `each.key`, which corresponds to the deployment name i.e `dev-gpt-EU-a`.
- `outbound_network_access_restricted`: Specifies if outbound network access is restricted for the cognitive account.
- `public_network_access_enabled`: Determines if public network access is enabled for the cognitive account.
- `resource_group_name`: Specifies the name of the resource group where the cognitive account is created i.e `DEV-GPT`.
- `sku_name`: Sets the SKU (service level) for the cognitive account to "S0".
- `tags`: Specifies any tags to be associated with the cognitive account.
- `network_acls`: Defines the network access control rules for the cognitive account, including the default action and IP rules.
- `timeouts`: Configures timeouts for creating or updating the cognitive account.

### [azurerm_cognitive_deployment Resource Block](#azurerm_cognitive_deployment-resource-block)

The `azurerm_cognitive_deployment` resource block defines the deployment of cognitive models within the cognitive account. It uses the `for_each` meta-argument to iterate over the `local.cognitive_deployments` list, which contains the flattened list of deployment configurations.

given the variables defined above in `variables.tf` and `dev.tfvars` we would end up with a flattened list like so

```hcl
locals {
  cognitive_deployments = [
    {
      deployment_name       = "dev-gpt-EU-a"
      cognitive_account_id  = "<cognitive-account-id>"
      model_name            = "gpt-35-turbo"
      version               = "0301"
    },
    {
      deployment_name       = "dev-gpt-EU-a"
      cognitive_account_id  = "<cognitive-account-id>"
      model_name            = "code-davinci-002"
      version               = "1"
    },
    {
      deployment_name       = "dev-gpt-US-a"
      cognitive_account_id  = "<cognitive-account-id>"
      model_name            = "gpt-35-turbo"
      version               = "0301"
    },
    {
      deployment_name       = "dev-gpt-US-a"
      cognitive_account_id  = "<cognitive-account-id>"
      model_name            = "gpt-4"
      version               = "0314"
    }
  ]
}
```
**i.e two deployments, each with specific model deployments relative to their region.**{: .important-statement}


- `for_each`: Iterates over the `local.cognitive_deployments` list to create a cognitive deployment for each model within each deployment.
- `cognitive_account_id`: Specifies the ID of the cognitive account associated with the deployment, obtained from `each.value.cognitive_account_id`. This is dynamicaly assigned when the `azurerm_cognitive_account` resource block is deployed.
- `name`: Sets the name of the cognitive deployment to `each.value.model_name`, which corresponds to the model.
- `model`: Defines the cognitive model to be deployed, including its format, name, and version. The format is set to "OpenAI", and the name and version are obtained from 
  -`each.value.model_name` and `each.value.version`, respectively.
- `scale`: Specifies the scale type for the deployment, which is set to "Standard" in this case.
- `timeouts`: Configures timeouts for creating or updating the cognitive deployment.


## [Conclusion](#conclusion)

By using nested loops and locals, we achieved several benefits. First, we eliminated the need for repetitive resource blocks and reduced code duplication. Second, we improved maintainability by centralizing the deployment logic and reducing the chances of human error. Finally, our solution significantly reduced deployment time, allowing us to scale efficiently.

Using Terraform now allows me to deploy multiple Cognitive accounts in different regions, with different model deployments per account in just a matter of minutes, something that took well over an hour via the GUI.

In conclusion, leveraging Terraform's nested loops with locals provided a powerful and efficient solution for deploying multiple Azure OpenAI instances with multiple models. By automating the deployment process, we saved time, reduced errors, and improved maintainability. Now, we can focus on exploring the potential of Azure OpenAI without being weighed down by manual setup.

Happy Terraforming!