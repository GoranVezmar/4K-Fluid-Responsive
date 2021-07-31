# 4k-fluid-responsive README

Converts pixels to vws, removes properties that have no value in pixes, and removes classes that have no properties left, from a selection of markup and places formated markup into clipboard. Markup can be pasted into a media query for screens bigger than 1920px.

## Usage

![Usage](usage.gif)

4K Fluid Responsive has one command, `Convert Pixels to VWs`. Select some SCSS markup, run the command and the transformed SCSS markup is added to your clipboard in the order they appear. Output is formated by Prettier. The default devider (the base width of the design) for calculating values is 1920, that is configurable in settings.

## Requirements

Uses the [ncp](https://github.com/xavi-/node-copy-paste) package, may require external dependencies in Linux and macOS.

## Future Plans

- [ ] Make it work with CSS and SASS files also
