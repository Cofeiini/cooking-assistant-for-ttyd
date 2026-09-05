import { assertType, updateScrollThumb } from "../index.ts";
import { recipes } from "./recipe-data.ts";
import { recipeNode } from "./recipe.ts";

const optionItems = [
    {
        checkbox: document.querySelector<HTMLLabelElement>("#menu-options-extra-checkbox")!,
        container: document.querySelector<HTMLDivElement>("#menu-options-extra-container")!,
        parentOption: document.querySelector<HTMLDivElement>("#menu-options-extra")!,
        title: document.querySelector<HTMLDivElement>("#menu-options-extra-checkbox-title")!,
        toggleFunction: (checked: boolean) => {
            document.querySelectorAll(".list-node").forEach(node => {
                node.classList.toggle("hidden-extra", !checked && (node.getAttribute("extra") === "true"));
            });
        },
    },
    {
        checkbox: document.querySelector<HTMLLabelElement>("#menu-options-cookbook-checkbox")!,
        container: document.querySelector<HTMLDivElement>("#menu-options-cookbook-container")!,
        parentOption: document.querySelector<HTMLDivElement>("#menu-options-cookbook")!,
        title: document.querySelector<HTMLDivElement>("#menu-options-cookbook-checkbox-title")!,
        toggleFunction: (checked: boolean) => {
            document.querySelectorAll(".list-node").forEach(node => {
                const hasMoreIngredients = node.querySelectorAll(".list-ingredient-label").length > 1;
                const isCookbookEntry = node.getAttribute("cookbook") === "true";
                node.classList.toggle("excluded", checked && (hasMoreIngredients || isCookbookEntry));
            });
        },
    },
    {
        checkbox: document.querySelector<HTMLLabelElement>("#menu-options-unique-checkbox")!,
        container: document.querySelector<HTMLDivElement>("#menu-options-unique-container")!,
        parentOption: document.querySelector<HTMLDivElement>("#menu-options-unique")!,
        title: document.querySelector<HTMLDivElement>("#menu-options-unique-checkbox-title")!,
        toggleFunction: (checked: boolean) => {
            const mistakeNumber = recipes.find(item => item.id === "mistake")!.number;
            document.querySelectorAll(".list-node").forEach(node => {
                const nodeNumber = Number(node.getAttribute("number"));
                const isMistake = nodeNumber === mistakeNumber;
                const hasAlternatives = Array.from(document.querySelectorAll(`.list-node[number="${nodeNumber}"]`)).filter(element => element.getAttribute("extra") === "false").length > 1;
                node.classList.toggle("non-unique", checked && (hasAlternatives || isMistake));
            });
        },
    },
    {
        checkbox: document.querySelector<HTMLLabelElement>("#menu-options-effects-checkbox")!,
        container: document.querySelector<HTMLDivElement>("#menu-options-effects-container")!,
        parentOption: document.querySelector<HTMLDivElement>("#menu-options-effects")!,
        title: document.querySelector<HTMLDivElement>("#menu-options-effects-checkbox-title")!,
        toggleFunction: (checked: boolean) => {
            document.querySelectorAll(".list-node").forEach(node => {
                const hasSideEffect = node.getAttribute("has-effect") === "true";
                node.classList.toggle("no-side-effect", checked && !hasSideEffect);
            });
        },
    },
];
for (const { checkbox, title, container, parentOption, toggleFunction } of optionItems) {
    checkbox.addEventListener("click", (event) => {
        event.stopPropagation();

        const { checked } = assertType<HTMLInputElement>(event.target);
        title.innerText = checked ? "ON" : "OFF";
        toggleFunction(checked);
        requestAnimationFrame(updateScrollThumb);
    });

    parentOption.addEventListener("mouseenter", () => {
        container.showPopover({ source: parentOption });
    });

    parentOption.addEventListener("mouseleave", () => {
        container.hidePopover();
    });

    parentOption.addEventListener("click", (event) => {
        event.preventDefault();
        checkbox.click();
    });

    const { checked } = assertType<HTMLInputElement>(checkbox);
    if (checked) {
        checkbox.click();
    }
}

const recipeList = document.querySelector<HTMLDivElement>("#recipe-list")!;
const searchList = new Set<string>();
for (const recipe of recipes) {
    searchList.add(recipe.name);
    for (const option of recipe.options) {
        option.ingredients.forEach((ingredient) => {
            searchList.add(ingredient.name);
        });
        recipeList.appendChild(recipeNode(recipe, option));
    }
}

const searchData = document.querySelector<HTMLDataListElement>("#search-data")!;
Array.from(searchList).sort().forEach(key => {
    const searchOption = document.createElement("option");
    searchOption.value = key;
    searchData.append(searchOption);
});

const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
searchInput.addEventListener("input", () => {
    const isExact = searchList.has(searchInput.value.trim());
    const searchValue = searchInput.value.trim().toLowerCase();
    const hasInput = searchValue.length > 0;
    document.querySelectorAll(".list-node").forEach(node => {
        const label = node.querySelector<HTMLDivElement>(".list-item-label")!;
        const recipeName = label.textContent.toLowerCase();
        const ingredients = node.querySelectorAll<HTMLDivElement>(".list-ingredient-item");

        let matchLabel = searchValue === recipeName;
        let matchIngredient = false;
        if (isExact) {
            for (const ingredient of ingredients) {
                const match = searchValue === ingredient.querySelector<HTMLDivElement>(".list-ingredient-label")!.textContent.toLowerCase();
                ingredient.classList.toggle("search-highlight", hasInput && match);
                matchIngredient ||= match;
            }
        } else {
            matchLabel = recipeName.includes(searchValue);
            for (const ingredient of ingredients) {
                const match = ingredient.querySelector<HTMLDivElement>(".list-ingredient-label")!.textContent.toLowerCase().includes(searchValue);
                ingredient.classList.toggle("search-highlight", hasInput && match);
                matchIngredient ||= match;
            }
        }

        node.classList.toggle("hidden", hasInput && !matchLabel && !matchIngredient);
        label.classList.toggle("search-highlight", hasInput && matchLabel);
    });

    requestAnimationFrame(updateScrollThumb);
});

enum SortDirection {
    ASCENDING = "0",
    DESCENDING = "1",
    UNSPECIFIED = "2",
}

const sortingName = document.querySelector<HTMLButtonElement>("#sorting-name")!;
sortingName.setAttribute("direction", String(SortDirection.UNSPECIFIED));

const sortingPrice = document.querySelector<HTMLButtonElement>("#sorting-price")!;
sortingPrice.setAttribute("direction", String(SortDirection.UNSPECIFIED));

const sortingNumber = document.querySelector<HTMLButtonElement>("#sorting-number")!;
sortingNumber.setAttribute("direction", String(SortDirection.UNSPECIFIED));
sortingNumber.addEventListener("click", () => {
    sortingName.setAttribute("direction", String(SortDirection.UNSPECIFIED));
    sortingPrice.setAttribute("direction", String(SortDirection.UNSPECIFIED));

    const sortedRecipes = Array.from(recipeList.querySelectorAll<HTMLDivElement>(".list-node"));
    const direction = assertType<SortDirection>(sortingNumber.getAttribute("direction")!);
    switch (direction) {
        case SortDirection.ASCENDING: {
            sortingNumber.setAttribute("direction", String(SortDirection.DESCENDING));
            sortedRecipes.sort((a, b) => Number(b.getAttribute("number")) - Number(a.getAttribute("number")));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingNumber.setAttribute("direction", String(SortDirection.ASCENDING));
            sortedRecipes.sort((a, b) => Number(a.getAttribute("number")) - Number(b.getAttribute("number")));
            break;
        }
    }

    recipeList.replaceChildren(...sortedRecipes);
});
sortingNumber.click();

sortingName.addEventListener("click", () => {
    sortingNumber.setAttribute("direction", String(SortDirection.UNSPECIFIED));
    sortingPrice.setAttribute("direction", String(SortDirection.UNSPECIFIED));

    const sortedRecipes = Array.from(recipeList.querySelectorAll<HTMLDivElement>(".list-node"));
    switch (assertType<SortDirection>(sortingName.getAttribute("direction"))) {
        case SortDirection.ASCENDING: {
            sortingName.setAttribute("direction", String(SortDirection.DESCENDING));
            sortedRecipes.sort((a, b) => b.querySelector<HTMLDivElement>(".list-item-label")!.innerText.localeCompare(a.querySelector<HTMLDivElement>(".list-item-label")!.innerText));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingName.setAttribute("direction", String(SortDirection.ASCENDING));
            sortedRecipes.sort((a, b) => a.querySelector<HTMLDivElement>(".list-item-label")!.innerText.localeCompare(b.querySelector<HTMLDivElement>(".list-item-label")!.innerText));
            break;
        }
    }

    recipeList.replaceChildren(...sortedRecipes);
});

sortingPrice.addEventListener("click", () => {
    sortingNumber.setAttribute("direction", String(SortDirection.UNSPECIFIED));
    sortingName.setAttribute("direction", String(SortDirection.UNSPECIFIED));

    const sortedRecipes = Array.from(recipeList.querySelectorAll(".list-node"));
    switch (assertType<SortDirection>(sortingPrice.getAttribute("direction"))) {
        case SortDirection.ASCENDING: {
            sortingPrice.setAttribute("direction", String(SortDirection.DESCENDING));
            sortedRecipes.sort((a, b) => Number(b.querySelector<HTMLDivElement>(".list-item-coin-label")!.innerText) - Number(a.querySelector<HTMLDivElement>(".list-item-coin-label")!.innerText));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingPrice.setAttribute("direction", String(SortDirection.ASCENDING));
            sortedRecipes.sort((a, b) => Number(a.getAttribute("price")) - Number(b.getAttribute("price")));
            break;
        }
    }

    recipeList.replaceChildren(...sortedRecipes);
});
