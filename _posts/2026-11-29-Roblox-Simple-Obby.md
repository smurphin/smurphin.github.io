---
layout: post
title: Create a simple Roblox game for kids
date: 2026-01-29T00:00:00.000Z
categories: Coding
short_title: Basic Roblox Tutorial
tags:
  - Roblox
  - Coding For Kids
---
This is a simple Roblox guide to create a basic floor is lava obstacle course, I created it to go through with my son, so he could learn a bit of coding and build his first video game.

<!-- toc -->

- [🛠️ Part 1: Setting up the "Brain" (Coding in VS Code)](#%F0%9F%9B%A0%EF%B8%8F-part-1-setting-up-the-brain-coding-in-vs-code)
  * [1. The Lava Script](#1-the-lava-script)
  * [2. The Win Script](#2-the-win-script)
- [🎮 Part 2: Mastering the View (How to move)](#%F0%9F%8E%AE-part-2-mastering-the-view-how-to-move)
- [🏗️ Part 3: Building the World (Roblox Studio)](#%F0%9F%8F%97%EF%B8%8F-part-3-building-the-world-roblox-studio)
  * [1. The Lava Blocks](#1-the-lava-blocks)
  * [2. The Spinning Whacker](#2-the-spinning-whacker)
  * [3. The Win Pad](#3-the-win-pad)

<!-- tocstop -->

## 🛠️ Part 1: Setting up the "Brain" (Coding in VS Code)

Open **VS Code**. In the new project folder, create two files inside the `src/server` folder.

### 1. The Lava Script

Copy and paste this into a new file named `LavaScript.server.luau`. This makes red blocks dangerous!

```lua
-- 1. Setup the "Lava" rules
local CollectionService = game:GetService("CollectionService")
local DAMAGE_AMOUNT = 5 -- ⚡ CHANGE THIS: Use a bigger number to kill faster!
local TICK_RATE = 0.5   -- ⏱️ CHANGE THIS: Use a smaller number to damage faster!

local function onTouch(otherPart, lavaPart)
    local character = otherPart.Parent
    local humanoid = character:FindFirstChild("Humanoid")

    if humanoid then
        -- Don't start two loops at once
        if humanoid:GetAttribute("IsOnLava") then return end
        humanoid:SetAttribute("IsOnLava", true)

        repeat
            humanoid.Health -= DAMAGE_AMOUNT
            task.wait(TICK_RATE)

            -- Check if we are still touching this lava block
            local stillTouching = false
            for _, part in ipairs(lavaPart:GetTouchingParts()) do
                if part:IsDescendantOf(character) then stillTouching = true break end
            end
        until not stillTouching or humanoid.Health <= 0
        
        humanoid:SetAttribute("IsOnLava", false)
    end
end

-- Connect the logic to any block with the "Lava" tag
local function setupLava(part)
    part.Touched:Connect(function(otherPart) onTouch(otherPart, part) end)
end

for _, part in ipairs(CollectionService:GetTagged("Lava")) do setupLava(part) end
CollectionService:GetInstanceAddedSignal("Lava"):Connect(setupLava)

```

### 2. The Win Script

Copy and paste this into a file named `WinnerScript.server.luau`. This makes the finish line work.

```lua
local WIN_PART_NAME = "WinPart"

local function onWin(otherPart)
    local character = otherPart.Parent
    local player = game.Players:GetPlayerFromCharacter(character)

    if player then
        -- Create a big message at the top of the screen
        local message = Instance.new("Hint")
        message.Text = "🎉 " .. player.Name .. " REACHED THE END! 🎉"
        message.Parent = game.Workspace
        
        -- Make it sparkle!
        local sparkles = Instance.new("ParticleEmitter")
        sparkles.Parent = otherPart
        
        task.wait(5) -- Message stays for 5 seconds
        message:Destroy()
        sparkles:Destroy()
    end
end

game.Workspace:WaitForChild(WIN_PART_NAME).Touched:Connect(onWin)

```

## 🎮 Part 2: Mastering the View (How to move)

Navigating a 3D world is like playing a game. Here are the "Pro" controls for moving around the Studio viewer:

| Action | Control |
| --- | --- |
| **Move Around** | Use **W, A, S, D** (Just like a game!) |
| **Look Around** | Hold the **Right Mouse Button** and move the mouse. |
| **Go Up / Down** | Press **E** to go up, **Q** to go down. |
| **Teleport to Object** | Select a part in the Explorer and press **F** (Focus). |
| **Slow Down** | Hold **Shift** while moving to move the camera slowly for detail work. |


## 🏗️ Part 3: Building the World (Roblox Studio)

Now, switch to **Roblox Studio**. You need to build the objects the scripts are looking for.

### 1. The Lava Blocks

1. Click **Part** at the top to make a block.
2. Change its **Color** to Red and **Material** to Neon in the Properties window.
3. **Crucial**: Open the **Tag Editor** (View Tab) and check the box for **Lava**.
4. **How to make it harder**: In VS Code, change `DAMAGE_AMOUNT` to `100` to make it a "1-hit-kill" block!

### 2. The Spinning Whacker

1. Make a small block on the floor and **Anchor** it (This is the "Base").
2. Make a long thin beam (The "Spinner") and put it on top. Do **NOT** anchor it.
3. In the **Model** tab, click **Create -> Hinge**. Click the Base, then click the Spinner.
4. In the Properties for that Hinge:
* Change **ActuatorType** to **Motor**.
* **MotorMaxAcceleration**: Set to `1000`.
* **AngularVelocity**: Set to `5`.
* **🚀 CHANGE THIS**: Make `AngularVelocity` a bigger number (like `20`) to make it spin super fast!

### 3. The Win Pad

1. Make one last block at the end.
2. In the Properties window, change its **Name** to exactly: `WinPart`.
3. Change its color to Gold!

