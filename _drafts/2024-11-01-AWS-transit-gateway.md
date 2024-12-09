---
layout: post
title: Connecting Multiple VPCs with Transit Gateway
date: 2024-11-01T00:00:00.000Z
categories: Terraform AWS Networking
short_title: AWS Transit Gateway
tags:
  - AWS
  - Networking
  - IaC
  - Infrastructure
  - Terraform
---

This post explores how to use Transit Gateway to simplify network management, boost security, and easily connect multiple VPCs. We'll cover what Transit Gateway is, its benefits, and a step-by-step guide to get you started.

## Introduction

As your cloud infrastructure grows on AWS, managing connectivity between your Virtual Private Clouds (VPCs) can become increasingly complex. Traditional methods like VPC peering, while functional, often lead to intricate network architectures and cumbersome routing configurations, especially as you add more VPCs to the mix.  Imagine trying to manage connectivity rules and security policies across dozens of interconnected VPCs – it quickly becomes a headache!

Fortunately, AWS offers a powerful solution to simplify this challenge: the Transit Gateway.  This service acts as a central hub for your VPCs, enabling you to connect them seamlessly and manage network traffic with ease. With Transit Gateway, you can centralise routing, improve security, and scale your network efficiently, all while reducing management overhead.  In this post, we'll explore the benefits of Transit Gateway and walk through how to connect your VPCs using this service.

## What is a Transit Gateway?

In the world of AWS networking, a Transit Gateway acts as a central hub, much like a bustling airport terminal. Instead of passengers, it manages the flow of network traffic between your various VPCs and on-premises networks. Think of it as a highly scalable and efficient router residing in the cloud. 

Here's a breakdown of its key components:

* **Attachments:** These are the connections that link your VPCs, VPNs, and on-premises networks to the Transit Gateway. Each connection is made only once, simplifying your network architecture.

* **Route Tables:** Like traffic signals directing the flow of vehicles, route tables within the Transit Gateway control how network traffic is routed between the connected networks. You define rules to determine where traffic should go based on its destination.

* **Route Propagation:** This mechanism automatically shares route information between the connected networks, ensuring that traffic can flow smoothly and efficiently.

By centralizing routing and connectivity management, Transit Gateway eliminates the need for complex peering relationships between individual VPCs. This makes it much easier to scale your network, and maintain control over your cloud infrastructure.

## VPC Peering vs. Transit Gateway

One key thing to remember when comparing VPC peering with Transit Gateway is the VPC peering connections are non transititve, meaning when you have multiple VPCs you must build a full mesh.  Also, if you want to have a dedicated egress VPC to enable you to centralise your internet security, this wouldn't be possible with VPC peering without using a third party routing solution.

Choosing the right method for connecting your VPCs is an important decision. Here's a breakdown of the key differences between VPC peering and Transit Gateway:

| Feature | VPC Peering | Transit Gateway |
|---|---|---|
| **Architecture** |  Decentralised (mesh) | centralised (hub-and-spoke) |
| **Scalability** | Limited - (number of peering connections per VPC) | High - (supports large number of connections) |
| **Routing** |  Direct, between peered VPCs |  centralised, through the Transit Gateway |
| **Connectivity** |  Limited to VPCs within the same region |  Can connect VPCs across regions and on-premises networks |
| **Security** |  Security groups and network ACLs managed per VPC |  centralised security policy management at the Transit Gateway level |
| **Complexity** |  Increases with the number of VPCs - (more peering connections to manage) |  Remains relatively consistent as you add more VPCs |
| **Cost** |  No additional cost for data transfer between peered VPCs |  Charges apply for data processed by the Transit Gateway |
| **Use Cases** |  Simple, small-scale networks with few VPCs |  Large, complex networks with many VPCs, inter-region connectivity, and centralised routing |

**In simpler terms:**

* **VPC peering** is like directly connecting two houses with a dedicated pathway. It's simple for a small setup, but imagine the complexity if you had to connect dozens of houses this way!

* **Transit Gateway** is like a central train station connecting multiple destinations. It's more scalable and organized, making it easier to manage connections as your network expands.

Ultimately, the best choice depends on your specific needs and the complexity of your network. If you have a small number of VPCs and don't require advanced features like inter-region connectivity or centralised routing, VPC peering might suffice. But if you anticipate significant growth, need to connect VPCs across regions, or want to simplify security management, Transit Gateway is the way to go.

## Why Use a Transit Gateway?

While VPC peering might seem like a straightforward way to connect VPCs, it can quickly become a tangled web as your network grows. Transit Gateway offers a compelling alternative with several key advantages:

* **centralised Routing:**  Say goodbye to configuring individual peering connections between every VPC! With Transit Gateway, you can manage routes in a single, central location. This significantly simplifies network administration, especially in complex environments.

* **Scalability:**  Need to connect dozens or even hundreds of VPCs? No problem! Transit Gateway is built to handle massive scale, allowing you to easily expand your network without hitting connectivity bottlenecks.

* **Enhanced Security:** As we discussed earlier, Transit Gateway makes it easier to implement security policies and segment your network. This enhances your security posture and helps protect sensitive data.

* **Inter-Region Connectivity:**  Need to connect VPCs across different AWS regions? Transit Gateway enables communication between your geographically dispersed resources.

* **Simplified Network Architecture:**  Transit Gateway replaces the need for complex mesh networks created by VPC peering, resulting in a cleaner and more manageable network topology.

In essence, Transit Gateway provides a more robust, scalable, and secure approach to connecting your VPCs compared to traditional methods. It's a valuable tool for any organization looking to simplify network management and optimize their cloud infrastructure.

## Walkthrough: Deploying and using AWS Transit Gateway (TGW)

**Prerequisites:**

1. You must have an AWS account with at least two VPCs in the same region.
    * Consider using my basic AWS deployment guide [here]({{ site.baseurl }}{% post_url 2023-06-08-Basic-AWS-Networking-with-Terraform %}){:target="_blank"} as a starting point, using two separate deployments with different environments, some example code for that can be found [here](https://github.com/smurphin/aws-terraform-networking-multi-env){:target="_blank"} be sure to initialise the backend for each environment as described [here]({{ site.baseurl }}{% post_url 2023-04-17-Terraform-S3-backend %}){:target="_blank"}.

    * The starting topology should look like the diagram below:

    * ![centered](/assets/images/AWS_Networking-Single_Region_Dual_VPC.png)

2. You must have IAM permissions to create and manage Transit Gateways, VPC attachments, and route tables, as detailed as described [here]({{ site.baseurl }}{% post_url 2023-06-01-Get-setup-to-use-terraform-with-aws %}){:target="_blank"}.

**Target topology**

Now we're going to create a Transit Gateway, connect the two VPCs with attachments and configure the routing between them.  I'm going to configure this in a separate repo and use a dedicated state file for the TGW configuration, this means we can work with the TGW independantly, limits blast radius and means we can reuse the code on other projects easily.  As part of the deployment we'll lookup the IDs of the VPCs and components that we want to connect.

    The final setup should look like the diagram below:

    * ![centered](/assets/images/AWS_Networking-Single_Region_Dual_VPC.png)




**Step 1: Create the Transit Gateway**

1. Go to the AWS Management Console and navigate to the VPC service.
2. In the left navigation pane, select **Transit Gateways**.
3. Click on **Create Transit Gateway**.
4. Enter a name for your Transit Gateway and choose a region.
5. Click **Create Transit Gateway**.

**Step 2: Attach your VPCs to your Transit Gateway**

1. In the left navigation pane, select **Transit Gateway Attachments**.
2. Click on **Create Transit Gateway Attachment**.
3. Select the Transit Gateway you want to attach the VPC to.
4. Select the VPC you want to attach to the Transit Gateway.
5. Click **Create Transit Gateway Attachment**.

**Step 3: Add routes between the Transit Gateway and your VPCs**

1. In the left navigation pane, select **Transit Gateway Route Tables**.
2. Click on the **ID** of the route table that is associated with the Transit Gateway attachment for your VPC.
3. Click on **Actions** and then select **Edit**.
4. Click on **Create Route**.
5. Enter the destination CIDR block for the route.
6. Select the Transit Gateway attachment for the VPC that you want to route traffic to.
7. Click **Save**.

**Step 4: Test the Transit Gateway**

1. Launch an instance in each of your VPCs.
2. From an instance in one VPC, try to ping an instance in the other VPC.
3. If the ping is successful, then your VPCs are successfully connected through the Transit Gateway.

**Additional Notes:**

* You can add additional VPCs to your Transit Gateway at any time.
* You can also use Transit Gateway to connect your VPCs to on-premises networks using AWS Direct Connect or VPN connections.
* For more information about Transit Gateways, please see the AWS documentation: [https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)



