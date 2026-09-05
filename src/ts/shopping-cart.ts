import { ingredientDatabase } from "./recipe.ts";

const shoppingCartTotal = document.querySelector<HTMLDivElement>("#shopping-cart-total")!;
const shoppingListContent = document.querySelector<HTMLDivElement>("#shopping-list-content")!;
const shoppingListTotal = document.querySelector<HTMLDivElement>("#shopping-list-footer-total")!;

interface ShoppingCartItem {
    count: number;
    image: string;
    name: string;
}

export const handleShoppingCart = (): void => {
    let items = {} as Record<string, ShoppingCartItem>;
    document.querySelectorAll<HTMLDivElement>(".selected").forEach(item => {
        for (const ingredient of ingredientDatabase[item.getAttribute("id")!]!.ingredients) {
            items[ingredient.id] = {
                count: (items[ingredient.id]?.count ?? 0) + 1,
                image: ingredient.image,
                name: ingredient.name,
            };
        }
    });

    items = Object.fromEntries(Object.entries(items).sort(([, a], [, b]) => (b.count - a.count) || a.name.localeCompare(b.name)));
    const total = Object.values(items).reduce((totalValue, current) => totalValue + current.count, 0);
    shoppingCartTotal.innerText = String(total);
    shoppingListTotal.innerText = String(total);

    const shoppingCartItems = [];
    for (const ingredient of Object.values(items)) {
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
