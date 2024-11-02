<h1 align='center'>AeroMod</h1>

<p align="center">
   <img src="./build/appicon.png" width="15%"/><br/>
</p>

<p align="center">
An external mod manager for Microsoft Flight Simulator.
</p>

<p align="center">
  <a href="https://wails.io/">
    <img alt="wails" src="https://img.shields.io/badge/backend-wails-C23C36"/>
  </a>
  <a href="https://react.dev/">
    <img alt="react" src="https://img.shields.io/badge/frontend-react-36789A"/>
  </a>
</p>

<div align="center">
<strong>
<samp>

[English](README.md)

</samp>
</strong>
</div>

## About

AeroMod is a tool designed to efficiently manage Microsoft Flight Simulator mods. With AeroMod, you can easily enable, disable, install, and uninstall mods without physically moving files. AeroMod is Windows-only.

## Screenshots

![](./.github/screenshot-01.png)

### Verify Mods

![](./.github/screenshot-02.png)

### Install Mods

![](./.github/screenshot-03.png)

### Settings

![](./.github/screenshot-04.png)

## Features

- Enable/Disable mods.
- Install/Uninstall mods.
- Verify mod files.
- Search for mods.
- Display mod details such as type, author, and version.
- Filter mods using categories.

## Roadmap

- Add presets for saving enabled mods.
- Display scenery locations on a map.
- Mod grouping ability.
- Checking version conflicts.
- Installing mods from remote URLs.

## Environment Setup

- [Go](https://go.dev/doc/install)
- [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
- [Wails](https://wails.io/docs/next/gettingstarted/installation)

> As AeroMod is primarily developed using the Wails framework, the environment can be set up following the [installation tutorial of Wails](https://wails.io/docs/gettingstarted/installation).

### Installation

```bash
git clone https://github.com/metebykl/aeromod.git
cd aeromod
wails dev
```
