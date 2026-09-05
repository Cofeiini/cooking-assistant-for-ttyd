# Cooking Assistant for Paper Mario: The Thousand-Year Door
With the **Cooking Assistant** you can check recipes and plan your required ingredients for getting the in-game cooking trophy.

> The app page can be found here [https://cofeiini.github.io/cooking-assistant-for-ttyd](https://cofeiini.github.io/cooking-assistant-for-ttyd)

## Features
* Adjust options
  * Hide recipes requiring the cookbook
  * Show extra recipes using rearranged ingredients
  * Show recipes with side effects
  * Show unique recipes that have only one ingredient combination
* List all recipes and variants
* Search recipes and ingredients
  * Exact match with search suggestions
  * Fuzzy search with keywords
* Select recipes for cooking
  * List individual ingredient counts
  * Show total required ingredients
* Show recipe details on hover with possible side effects
* Sort recipes
  * By common selling price
  * By entry number
  * By recipe name

## Development
This project uses [Bun](https://bun.com/get) for managing the packages and compiling the assets
* To get started with development, execute `bun install` and possibly `bun update`
* To run a (slightly overengineered) local developer server, execute `bun run dev.ts` from the project root
  * The development server watches the `src` folder and automatically compiles the assets

> Make sure you don't save anything important in the `dist` folder, since it gets deleted automatically
