import type { Recipe, RecipeOption } from "./recipe-data.ts";
import { handleShoppingCart } from "./shopping-cart.ts";

const recipeList = document.querySelector<HTMLDivElement>("#recipe-list")!;
const cursor = document.querySelector<HTMLDivElement>("#cursor")!;

const previewHP = document.querySelector<HTMLDivElement>("#preview-stats-hp")!;
const previewFP = document.querySelector<HTMLDivElement>("#preview-stats-fp")!;
const previewEffect = document.querySelector<HTMLDivElement>("#preview-stats-effect")!;
const previewImage = document.querySelector<HTMLImageElement>("#preview-image")!;
const previewText = document.querySelector<HTMLDivElement>("#preview-text")!;

export const ingredientDatabase = {} as Record<string, RecipeOption>;

let nodeCounter = 0;
export const recipeNode = (recipe: Recipe, option: RecipeOption): HTMLDivElement => {
    const id = String(++nodeCounter);
    ingredientDatabase[id] = option;

    const node = document.createElement("div");
    node.className = "list-node";
    node.setAttribute("id", id);
    node.setAttribute("number", String(recipe.number));
    node.setAttribute("price", String(recipe.stats.price));
    node.setAttribute("extra", String(option.extra ?? false));
    node.setAttribute("has-effect", String(recipe.stats.effect.length > 0));
    node.setAttribute("cookbook", String(option.cookbook));

    if (option.extra) {
        node.classList.add("hidden-extra");
    }

    const item = document.createElement("div");
    item.className = "list-item";
    node.appendChild(item);

    const container = document.createElement("div");
    container.className = "list-item-container";
    item.appendChild(container);

    const background = document.createElement("div");
    background.className = "list-item-background";
    container.appendChild(background);

    const itemSlot = document.createElement("div");
    itemSlot.className = "list-item-slot";
    background.appendChild(itemSlot);

    const image = document.createElement("img");
    image.className = "list-item-image";
    image.loading = "lazy";
    image.src = recipe.image;
    image.alt = recipe.id;
    background.appendChild(image);

    const optionCookbook = document.createElement("img");
    optionCookbook.src = "assets/cookbook.png";
    optionCookbook.alt = "cookbook";
    optionCookbook.title = "Requires the Cookbook";
    optionCookbook.className = "list-item-cookbook";
    if (!option.cookbook) {
        optionCookbook.classList.add("invisible");
    }
    background.appendChild(optionCookbook);

    const number = document.createElement("div");
    number.className = "list-item-number";
    number.innerText = String(recipe.number);
    background.appendChild(number);

    const label = document.createElement("div");
    label.className = "list-item-label";
    label.innerText = recipe.name;
    background.appendChild(label);

    const ingredient = document.createElement("div");
    ingredient.className = "list-item";
    node.appendChild(ingredient);

    const ingredientContainer = document.createElement("div");
    ingredientContainer.className = "list-ingredient-container";
    ingredient.appendChild(ingredientContainer);

    const ingredientCount = option.ingredients.length;
    for (let i = 0; i < ingredientCount; ++i) {
        const ingredientData = option.ingredients.at(i)!;

        const ingredientItem = document.createElement("div");
        ingredientItem.className = "list-ingredient-item";
        ingredientContainer.appendChild(ingredientItem);

        const ingredientImage = document.createElement("img");
        ingredientImage.className = "list-ingredient-image";
        ingredientImage.loading = "lazy";
        ingredientImage.src = ingredientData.image;
        ingredientImage.alt = ingredientData.id;
        ingredientItem.appendChild(ingredientImage);

        const ingredientLabel = document.createElement("div");
        ingredientLabel.className = "list-ingredient-label";
        ingredientLabel.innerText = ingredientData.name;
        ingredientItem.appendChild(ingredientLabel);

        if ((i + 1) < ingredientCount) {
            const plus = document.createElement("div");
            plus.className = "list-ingredient-plus";
            plus.innerHTML = "&#x2795;";
            ingredientContainer.appendChild(plus);
        }
    }

    const price = document.createElement("div");
    price.classList.add("list-item", "list-item-coin");
    node.appendChild(price);

    const priceContainer = document.createElement("div");
    priceContainer.className = "list-item-coin-container";
    price.appendChild(priceContainer);

    const coin = document.createElement("img");
    coin.className = "list-item-coin-image";
    coin.src = "assets/coin.png";
    coin.alt = "Selling price";
    priceContainer.appendChild(coin);

    const priceLabel = document.createElement("div");
    priceLabel.className = "list-item-coin-label";
    priceLabel.innerText = String(recipe.stats.price);
    priceContainer.appendChild(priceLabel);

    node.addEventListener("mouseenter", () => {
        cursor.hidePopover();

        recipeList.querySelectorAll<HTMLDivElement>(".highlighted").forEach(element => {
            element.classList.remove("highlighted");
        });

        cursor.showPopover({ source: node });
        cursor.classList.toggle("invisible", false);
        node.classList.add("highlighted");

        previewHP.innerText = String(recipe.stats.hp);
        previewFP.innerText = String(recipe.stats.fp);
        previewEffect.innerHTML = recipe.stats.effect.replace(/\*\*([\w\s]+)\*\*/g, "<b>$1</b>");
        previewEffect.setAttribute("has-content", String(recipe.stats.effect.length > 0));
        previewImage.src = recipe.image;
        previewText.innerText = recipe.name;
    });

    node.addEventListener("mousedown", (event) => {
        if (event.button !== 0) {
            return;
        }

        node.style.removeProperty("--color-background");
        node.classList.toggle("selected");
        if (node.classList.contains("selected")) {
            const color = Math.random().toString(16).substring(2, 8);
            const lighterColor = color.replace(/../g, value => Math.min(255, Math.max(0, parseInt(value, 16) + 25)).toString(16).padStart(2, "0"));
            node.style.setProperty("--color-background", `repeating-linear-gradient(45deg, #${color} 0 0.5vw, #${lighterColor} 0.5vw 1vw)`);
        }

        handleShoppingCart();
    });

    return node;
};
