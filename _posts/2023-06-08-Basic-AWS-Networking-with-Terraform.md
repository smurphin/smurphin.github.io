---
layout: post
title:  "Creating a basic AWS network with Terraform"
date:   2023-06-08
categories: Terraform AWS Networking
short_title: AWS Network with Terraform
tags: [AWS, Networking, IaC, Infrastructure, Terraform]
#author: John Doe
---
Amazon Web Services (AWS) offers a wide range of cloud computing services, one of which is networking. In this post, I'll go over the fundamentals of setting up a basic but robust and scalable network infrastructure using AWS and Terraform. 

To begin I'll cover the creation of a single Virtual Private Cloud (VPC), configuration of multiple Availability Zones (AZs), setting up public and private subnets, in a single region, I'll then look at adding an Internet Gateway, and Network Address Translation (NAT) Gateways.

## AWS Networking: An Overview

AWS provides scalable and highly reliable networking services which allow businesses to design and implement a network infrastructure meeting their specific requirements. Core components of AWS networking include:

- **AWS Account:** is an Amazon Web Services identity that you use to log in and access AWS services. Each AWS account has its own resources, separate from other accounts, and its own limits on each AWS service. It is essentially your own workspace within the vast expanse of AWS cloud services.

- **AWS Region:** is a physical location around the world where AWS clusters data centers. Each AWS Region is designed to be isolated from the other AWS Regions. This achieves the greatest possible fault tolerance and stability.- **VPC:** Virtual Private Cloud allows you to provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network defined by you.

- **Subnets:** A subnet is a range of IP addresses in your VPC. You can launch AWS resources into a subnet that you select.

- **Availability Zones (AZs):** AZs are essentially isolated and physically separate locations within regions from which cloud services originate and operate. They are physically separated within a geographic region and are designed to minimize failures. With multiple AZs, your resources can remain resilient against potential outages.

- The following diagram gives an overview of these components and their relation to each other

![centered](/assets/images/AWS_single_act_single_region_single_vpc.png)

## Why Deploy Multiple AZs, Public and Private Subnets?

The deployment of multiple AZs and the differentiation of public and private subnets within your VPC allows you to increase availability, fault tolerance, and scalability of your applications. 

- **Multiple AZs:** By deploying your resources across multiple AZs, you can ensure high availability and fault tolerance. If one AZ becomes unavailable, traffic can be directed to resources in another, ensuring your applications remain up and running.

- **Public and Private Subnets:** This design provides an extra layer of security by limiting the exposure of your resources. Resources that must be publicly accessible are placed in a public subnet with routes to the Internet Gateway. Those that don't require internet access are placed in a private subnet, improving security.

## Terraform project structure 

I'll be using my standard approach to structuring the terraform project, with individual files for specific functions and separate vars files per environment, read more about that [here]({{ site.baseurl }}{% post_url 2023-06-07-how-I-structure-my-terraform-projects %}){:target="_blank"}

## Walkthrough: Creating and Managing AWS Network with Terraform

Now, let's dive into setting up an AWS network with Terraform.

```hcl

# Required provider
provider "aws" {
  region = "us-west-2"
}

# Creating a VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Creating a public subnet
resource "aws_subnet" "public" {
  vpc_id     = "${aws_vpc.main.id}"
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = "true"
  availability_zone = "us-west-2a"
}

# Creating a private subnet
resource "aws_subnet" "private" {
  vpc_id     = "${aws_vpc.main.id}"
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-west-2a"
}

```

You may need to adjust the resources according to your specific requirements. Once you have edited your Terraform file, you can initialize the configuration with `terraform init`, validate it with `terraform validate`, and finally apply it with `terraform apply`.

This is a basic network setup, if had some workloads running in one of the subnets, they would be able to communicate with instances in any of the other subnets within the VPC.

**It's important to note, within a VPC it's possible to route between any of the subnets, public and private are just logical concepts and are only relevant for connections from outside the VPC, if you wish to restrict traffic flow between subnets within the VPC then security policies need to be used.**{: .important-statement}

Now we have the basic components in place we need to connect them to the world outside of the VPC, either the internet or other VPCs, AWS accounts, physical data centres etc.  For this post I'm going to focus on creating internet connectivity and I'll build on the other types of connectivity in separate posts.

We need to add some additional components to our Infrastructure to provide connectivity outside of the VPC

- **Internet Gateways:** An Internet Gateway is a horizontally scalable, redundant, and highly available VPC component that allows communication between instances in your VPC and the internet.
- **NAT Gateways:** A NAT Gateway enables instances in a private subnet to connect to the internet or other AWS services but prevents the internet from initiating a connection with those instances.

```hcl

# Creating an Internet Gateway and attaching it to the VPC
resource "aws_internet_gateway" "igw" {
  vpc_id = "${aws_vpc.main.id}"
}

# Creating a NAT Gateway
resource "aws_nat_gateway" "nat" {
  subnet_id     = "${aws_subnet.public.id}"
  allocation_id = "${aws_eip.nat.id}"
}
```

## Route tables ##

```hcl

# Creating a route table for the public subnet
resource "aws_route_table" "public" {
  vpc_id

 = "${aws_vpc.main.id}"
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.igw.id}"
  }
}

# Creating a route table for the private subnet
resource "aws_route_table" "private" {
  vpc_id = "${aws_vpc.main.id}"
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${aws_nat_gateway.nat.id}"
  }
}

# Associating the public subnet with its route table
resource "aws_route_table_association" "public" {
  subnet_id      = "${aws_subnet.public.id}"
  route_table_id = "${aws_route_table.public.id}"
}

# Associating the private subnet with its route table
resource "aws_route_table_association" "private" {
  subnet_id      = "${aws_subnet.private.id}"
  route_table_id = "${aws_route_table.private.id}"
}
```


## Conclusion

AWS networking is a vast and powerful domain that enables businesses to tailor network infrastructure to their specific needs. The combination of multiple AZs and the use of public and private subnets allows for a resilient, secure, and scalable infrastructure. We hope this post has helped you understand how to set up an AWS network using Terraform. Happy coding!

---

I hope this markdown post helps with your blog! Remember to replace the dummy links and data with your own.
