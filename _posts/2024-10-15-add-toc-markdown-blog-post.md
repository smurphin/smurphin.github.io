---
layout: post
title: Table of Contents creation for Markdown with markdown-toc
date: 2024-10-15T00:00:00.000Z
categories: Misc
short_title: Add ToC in markdown
tags:
  - Misc
---


<!-- toc -->

- [Why markdown-toc?](#why-markdown-toc)
- [How to Use markdown-toc](#how-to-use-markdown-toc)
  * [Installation:](#installation)
  * [Basic Usage:](#basic-usage)
- [Example](#example)
- [Conclusion](#conclusion)

<!-- tocstop -->

A well-structured table of contents (TOC) can significantly enhance the readability of your documents, especially when dealing with lengthy or technical content. I often find myself writing extensive posts that benefit from a clear TOC. However, manually creating and maintaining these TOCs can be tedious and time-consuming.

That's where [markdown-toc](https://github.com/jonschlinkert/markdown-toc){:target="_blank"} comes in. This handy tool automates the process of generating TOCs for your Markdown files, saving you time and effort while ensuring your content remains organized and accessible.

## Why markdown-toc?

[markdown-toc](https://github.com/jonschlinkert/markdown-toc){:target="_blank"} stands out for its simplicity and effectiveness. Here's what I appreciate most about it:

* **Ease of use:** A straightforward command-line interface makes it incredibly easy to use.
* **Flexibility:**  You can customize the TOC generation to match your preferences, such as specifying heading levels and list styles.
* **Accuracy:** `markdown-toc` reliably identifies headings in your Markdown files and generates accurate links.
* **Integration:** It seamlessly integrates into your existing workflow, whether you prefer using scripts or your favorite text editor.

## How to Use markdown-toc

Let's walk through the steps of using `markdown-toc`:

### Installation:
   Install `markdown-toc` using [npm](https://www.npmjs.com/){:target="_blank"}:
   
   ```bash
   npm install -g markdown-toc

   ```

### Basic Usage:
   Generate a TOC for your Markdown file:

   Once you've written your Markdown file, make sure you have included headers for the relevant sections you want to link in your TOC
   ```markdown
   # For Header 1
   ## For header 2
   ### for header 3
   ```
   and so on;

   Simply insert the line
   
  ![tag](/assets/images/markdown-toc-tag.png)
     
   into the file at the location you want the TOC to be generated, save the file and run 

   ```bash
   markdown-toc -i your_filename
   
   ```
   and, as if by magic your file will now have a TOC included!


## Example

Here's how I used `markdown-toc` in this blog post.  Add the `toc`tag into the file where I want the TOC to appear.

![before](/assets/images/markdown-toc-001.png)


run `markdown-toc -i ` against the file and here's the generated TOC inserted into my markdown file:

![after](/assets/images/markdown-toc-002.png)

## Conclusion

`markdown-toc` is a valuable tool for anyone working with Markdown. It simplifies the process of creating and managing TOCs, making your content more organized and user-friendly. Give it a try and see how it can improve your workflow!

You can find the code and details of the project over here -> [https://github.com/jonschlinkert/markdown-toc](https://github.com/jonschlinkert/markdown-toc){:target="_blank"}


I hope this is helpful! Please let me know if you have any feedback or questions. 😊



