import { updateScrollThumb } from "../index.js";
import { recipes } from "./recipe_data.js";

const rootContentContainer = document.querySelector("#root-content-container");
const rootContent = document.querySelector("#root-content");

const menuOptionsScaleLabel = document.querySelector("#menu-options-scale-label");
const changeScale = (value) => {
    const scale = Number(value);
    menuOptionsScaleLabel.innerText = scale.toFixed(1);
    document.documentElement.style.setProperty("--scale", scale.toString());
};

const menuOptionsScaleInput = document.querySelector("#menu-options-scale-input");
menuOptionsScaleInput.addEventListener("input", (event) => {
    changeScale(event.target.value);
});
menuOptionsScaleInput.addEventListener("wheel", (event) => {
    event.preventDefault();
    const scale = String(Math.min(2, Math.max(0.5, Number(menuOptionsScaleInput.value) + (Math.sign(event.deltaY) * 0.1))));
    menuOptionsScaleInput.value = scale;
    changeScale(scale);
});
changeScale(menuOptionsScaleInput.value);

[
    {
        parentOption: document.querySelector("#menu-options-extra"),
        checkbox: document.querySelector("#menu-options-extra-checkbox"),
        title: document.querySelector("#menu-options-extra-checkbox-title"),
        toggleFunction: (checked) => {
            document.querySelectorAll(".list-node").forEach(node => {
                if (node.classList.contains("vertical-spacer")) {
                    return;
                }

                if (node.getAttribute("extra") === "false") {
                    return;
                }

                node.classList.add("hidden-extra");
                if (checked) {
                    node.classList.remove("hidden-extra");
                }
            });
        },
    },
    {
        parentOption: document.querySelector("#menu-options-cookbook"),
        checkbox: document.querySelector("#menu-options-cookbook-checkbox"),
        title: document.querySelector("#menu-options-cookbook-checkbox-title"),
        toggleFunction: (checked) => {
            document.querySelectorAll(".list-node").forEach(node => {
                if (node.classList.contains("vertical-spacer")) {
                    return;
                }

                node.classList.add("excluded");
                const ingredientCount = node.querySelectorAll(".list-ingredient-label").length;
                const isCookbookEntry = node.querySelector(".list-item-cookbook.invisible") === null;
                if (!checked || ((ingredientCount < 2) && !isCookbookEntry)) {
                    node.classList.remove("excluded");
                }
            });

            rootContentContainer.dispatchEvent(new Event("scroll"));
        },
    },
    {
        parentOption: document.querySelector("#menu-options-unique"),
        checkbox: document.querySelector("#menu-options-unique-checkbox"),
        title: document.querySelector("#menu-options-unique-checkbox-title"),
        toggleFunction: (checked) => {
            const mistakeNumber = recipes.find(item => item.id === "mistake").number;
            document.querySelectorAll(".list-node").forEach(node => {
                if (node.classList.contains("vertical-spacer")) {
                    return;
                }

                node.classList.add("non-unique");
                const nodeNumber = Number(node.getAttribute("number"));
                const isMistake = nodeNumber === mistakeNumber;
                const hasAlternatives = Array.from(document.querySelectorAll(`.list-node[number="${nodeNumber}"]`)).filter(element => element.getAttribute("extra") === "false").length > 1;
                if (!checked || (!hasAlternatives && !isMistake)) {
                    node.classList.remove("non-unique");
                }
            });

            rootContentContainer.dispatchEvent(new Event("scroll"));
        },
    },
    {
        parentOption: document.querySelector("#menu-options-effects"),
        checkbox: document.querySelector("#menu-options-effects-checkbox"),
        title: document.querySelector("#menu-options-effects-checkbox-title"),
        toggleFunction: (checked) => {
            document.querySelectorAll(".list-node").forEach(node => {
                if (node.classList.contains("vertical-spacer")) {
                    return;
                }

                node.classList.add("no-side-effect");
                const hasSideEffect = node.getAttribute("has-effect") === "true";
                if (!checked || hasSideEffect) {
                    node.classList.remove("no-side-effect");
                }
            });

            rootContentContainer.dispatchEvent(new Event("scroll"));
        },
    },
].forEach(menuOption => {
    menuOption.checkbox.addEventListener("click", (event) => {
        event.stopPropagation();
        menuOption.title.innerText = event.target.checked ? "ON" : "OFF";
        menuOption.toggleFunction(event.target.checked);
        updateScrollThumb();
    });

    menuOption.parentOption.addEventListener("click", (event) => {
        event.preventDefault();
        menuOption.checkbox.click();
    });

    menuOption.title.innerText = menuOption.checkbox.checked ? "ON" : "OFF";
    menuOption.toggleFunction(menuOption.checkbox.checked);
});

const sortingField = document.querySelector("#sorting-field");
sortingField.classList.add("invisible");
document.querySelector("#menu-sorting").addEventListener("click", () => {
    sortingField.classList.toggle("invisible");
});

const searchInput = document.querySelector("#search-input");
searchInput.value = "";
const searchClear = document.querySelector("#search-clear");
searchClear.classList.add("invisible");
searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
});

searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();

    searchClear.classList.remove("invisible");
    if (searchValue.length === 0) {
        searchClear.classList.add("invisible");
    }

    document.querySelectorAll(".list-node").forEach(node => {
        if (node.classList.contains("vertical-spacer")) {
            return;
        }

        node.classList.add("hidden");

        const recipeName = node.querySelector(".list-item-label").textContent.toLowerCase();
        const ingredientNames = Array.from(node.querySelectorAll(".list-ingredient-label")).map(ingredient => ingredient.textContent.toLowerCase());
        if ((searchValue.length === 0) || recipeName.includes(searchValue) || ingredientNames.some(item => item.includes(searchValue))) {
            node.classList.remove("hidden");
        }
    });

    updateScrollThumb();
});

const SortDirection = {
    ASCENDING: 0,
    DESCENDING: 1,
    UNSPECIFIED: 2,
};

const sortingNumber = document.querySelector("#sorting-number");
sortingNumber.setAttribute("direction", SortDirection.UNSPECIFIED);
const sortingName = document.querySelector("#sorting-name");
sortingName.setAttribute("direction", SortDirection.UNSPECIFIED);
const sortingPrice = document.querySelector("#sorting-price");
sortingPrice.setAttribute("direction", SortDirection.UNSPECIFIED);

sortingNumber.addEventListener("click", () => {
    sortingName.setAttribute("direction", SortDirection.UNSPECIFIED);
    sortingPrice.setAttribute("direction", SortDirection.UNSPECIFIED);

    const sortedRecipes = Array.from(rootContent.querySelectorAll(".list-node")).filter(node => !node.classList.contains("vertical-spacer"));
    switch (Number(sortingNumber.getAttribute("direction"))) {
        case SortDirection.ASCENDING: {
            sortingNumber.setAttribute("direction", SortDirection.DESCENDING);
            sortedRecipes.sort((a, b) => Number(b.getAttribute("number")) - Number(a.getAttribute("number")));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingNumber.setAttribute("direction", SortDirection.ASCENDING);
            sortedRecipes.sort((a, b) => Number(a.getAttribute("number")) - Number(b.getAttribute("number")));
            break;
        }
    }

    const spacer = rootContent.querySelector(".vertical-spacer");
    rootContent.replaceChildren(...sortedRecipes, spacer);
});
sortingNumber.click();

sortingName.addEventListener("click", () => {
    sortingNumber.setAttribute("direction", SortDirection.UNSPECIFIED);
    sortingPrice.setAttribute("direction", SortDirection.UNSPECIFIED);

    const sortedRecipes = Array.from(rootContent.querySelectorAll(".list-node")).filter(node => !node.classList.contains("vertical-spacer"));
    switch (Number(sortingName.getAttribute("direction"))) {
        case SortDirection.ASCENDING: {
            sortingName.setAttribute("direction", SortDirection.DESCENDING);
            sortedRecipes.sort((a, b) => b.querySelector(".list-item-label").innerText.localeCompare(a.querySelector(".list-item-label").innerText));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingName.setAttribute("direction", SortDirection.ASCENDING);
            sortedRecipes.sort((a, b) => a.querySelector(".list-item-label").innerText.localeCompare(b.querySelector(".list-item-label").innerText));
            break;
        }
    }

    const spacer = rootContent.querySelector(".vertical-spacer");
    rootContent.replaceChildren(...sortedRecipes, spacer);
});

sortingPrice.addEventListener("click", () => {
    sortingNumber.setAttribute("direction", SortDirection.UNSPECIFIED);
    sortingName.setAttribute("direction", SortDirection.UNSPECIFIED);

    const sortedRecipes = Array.from(rootContent.querySelectorAll(".list-node")).filter(node => !node.classList.contains("vertical-spacer"));
    switch (Number(sortingPrice.getAttribute("direction"))) {
        case SortDirection.ASCENDING: {
            sortingPrice.setAttribute("direction", SortDirection.DESCENDING);
            sortedRecipes.sort((a, b) => Number(b.querySelector(".list-item-coin-label").innerText) - Number(a.querySelector(".list-item-coin-label").innerText));
            break;
        }
        case SortDirection.UNSPECIFIED:
        case SortDirection.DESCENDING: {
            sortingPrice.setAttribute("direction", SortDirection.ASCENDING);
            sortedRecipes.sort((a, b) => Number(a.getAttribute("price")) - Number(b.getAttribute("price")));
            break;
        }
    }

    const spacer = rootContent.querySelector(".vertical-spacer");
    rootContent.replaceChildren(...sortedRecipes, spacer);
});
