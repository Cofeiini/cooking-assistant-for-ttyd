import { ingredientDatabase } from "./recipe.js";

const shoppingCartTotal = document.querySelector("#shopping-cart-total");
const shoppingList = document.querySelector("#shopping-list");
const shoppingListContent = document.querySelector("#shopping-list-content");
const shoppingListTotal = document.querySelector("#shopping-list-footer-total");

shoppingList.classList.add("invisible");
document.querySelector("#shopping-cart").addEventListener("mousedown", () => {
    shoppingList.classList.toggle("invisible");
});

export const handleShoppingCart = () => {
    let shoppingCart = {};
    document.querySelectorAll(".selected").forEach(item => {
        for (const ingredient of ingredientDatabase[item.id].ingredients) {
            shoppingCart[ingredient.id] = {
                name: ingredient.name,
                count: (shoppingCart[ingredient.id]?.count || 0) + 1,
                image: ingredient.image,
            };
        }
    });

    const total = Object.values(shoppingCart).reduce((totalValue, current) => totalValue + current.count, 0);
    shoppingCart = Object.fromEntries(Object.entries(shoppingCart).sort(([, a], [, b]) => (b.count - a.count) || a.name.localeCompare(b.name)));
    shoppingCartTotal.innerText = total.toString();
    shoppingListTotal.innerText = total.toString();

    const shoppingCartItems = [];
    for (const item of Object.keys(shoppingCart)) {
        const ingredient = shoppingCart[item];

        const cartNode = document.createElement("div");
        cartNode.className = "shopping-cart-item";

        const nodeImage = document.createElement("img");
        nodeImage.className = "shopping-cart-item-image";
        nodeImage.loading = "lazy";
        nodeImage.src = ingredient.image;
        nodeImage.alt = "";
        cartNode.appendChild(nodeImage);

        const nodeText = document.createElement("div");
        nodeText.className = "shopping-cart-item-text";
        nodeText.innerText = ingredient.name;
        cartNode.appendChild(nodeText);

        const nodeAmount = document.createElement("div");
        nodeAmount.className = "shopping-cart-item-amount";
        nodeAmount.innerText = ingredient.count.toString();
        cartNode.appendChild(nodeAmount);

        shoppingCartItems.push(cartNode);
    }

    shoppingListContent.replaceChildren(...shoppingCartItems);
};
