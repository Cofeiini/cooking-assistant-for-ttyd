import { handleShoppingCart } from "./shopping_cart.js";

const rootContent = document.querySelector("#root-content");
const cursorAnchor = document.querySelector("#cursor-anchor");

const previewHP = document.querySelector("#preview-stats-hp");
const previewFP = document.querySelector("#preview-stats-fp");
const previewEffect = document.querySelector("#preview-stats-effect");
const previewImage = document.querySelector("#preview-image");
const previewText = document.querySelector("#preview-text");

export const ingredientDatabase = {};

export const recipeNode = (recipe, option) => {
    const id = crypto.randomUUID();
    ingredientDatabase[id] = option;

    const node = document.createElement("div");
    node.className = "list-node";
    node.setAttribute("id", id);
    node.setAttribute("number", recipe.number);
    node.setAttribute("price", recipe.stats.price);
    node.setAttribute("has-effect", String(recipe.stats.effect.length > 0));

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
    image.src = recipe.image;
    image.alt = "";
    background.appendChild(image);

    const optionCookbook = document.createElement("img");
    optionCookbook.src = "assets/cookbook.png";
    optionCookbook.alt = "";
    optionCookbook.title = "Requires the Cookbook";
    optionCookbook.className = "list-item-cookbook";
    if (!option.cookbook) {
        optionCookbook.classList.add("invisible");
    }
    background.appendChild(optionCookbook);

    const number = document.createElement("div");
    number.className = "list-item-number";
    number.innerText = recipe.number;
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
        const ingredientData = option.ingredients.at(i);

        const ingredientItem = document.createElement("div");
        ingredientItem.className = "list-ingredient-item";
        ingredientContainer.appendChild(ingredientItem);

        const ingredientImage = document.createElement("img");
        ingredientImage.className = "list-ingredient-image";
        ingredientImage.src = ingredientData.image;
        ingredientImage.alt = "";
        ingredientItem.appendChild(ingredientImage);

        const ingredientLabel = document.createElement("div");
        ingredientLabel.className = "list-ingredient-label";
        ingredientLabel.innerText = ingredientData.name;
        ingredientItem.appendChild(ingredientLabel);

        if ((i + 1) < ingredientCount) {
            const plus = document.createElement("div");
            plus.className = "list-ingredient-plus";
            plus.innerText = "+";
            ingredientContainer.appendChild(plus);
        }
    }

    const spacer = document.createElement("div");
    spacer.classList.add("list-item", "horizontal-spacer");
    node.appendChild(spacer);


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
    priceLabel.innerText = recipe.stats.price;
    priceContainer.appendChild(priceLabel);

    node.addEventListener("mouseenter", () => {
        for (const child of rootContent.children) {
            child.classList.remove("highlighted");
        }

        node.classList.add("highlighted");
        node.appendChild(cursorAnchor);

        previewHP.innerText = recipe.stats.hp;
        previewFP.innerText = recipe.stats.fp;
        previewEffect.innerHTML = recipe.stats.effect.replace(/\*\*([\w\s]+)\*\*/g, "<b>$1</b>");
        previewEffect.setAttribute("has-content", String(recipe.stats.effect.length > 0));
        previewImage.src = recipe.image;
        previewText.innerText = recipe.name;
    });

    node.addEventListener("mousedown", (event) => {
        if (event.button !== 0) {
            return;
        }

        node.classList.toggle("selected");

        const styleSheet = Array.from(document.styleSheets).find(sheet => sheet.href.toString().includes("list_node.css"));
        const ruleList = Array.from(styleSheet.cssRules);
        const ruleIndex = ruleList.indexOf(ruleList.find(entry => entry.cssText.includes(id)));
        if (ruleIndex > -1) {
            styleSheet.deleteRule(ruleIndex);
        }

        if (node.classList.contains("selected")) {
            const color = Math.random().toString(16).substring(2, 8);
            const lighterColor = color.replace(/../g, value => Math.min(255, Math.max(0, parseInt(value, 16) + 25)).toString(16).padStart(2, "0"));
            const newRule = `.list-node[id="${id}"]::before { background-image: repeating-linear-gradient(45deg, #${color}, #${color} 0.5vw, #${lighterColor} 0.5vw, #${lighterColor} 1vw); }`;
            styleSheet.insertRule(newRule);
        }

        handleShoppingCart();
    });

    return node;
};
