import { recipes } from "./js/recipe_data.js";
import { recipeNode } from "./js/recipe.js";

const rootElement = document.querySelector("#root");
const rootContentContainer = document.querySelector("#root-content-container");
const rootContent = document.querySelector("#root-content");

const scrollTrack = document.querySelector("#scrollbar-track");
const scrollThumb = document.querySelector("#scrollbar-thumb");

export const updateScrollThumb = () => {
    const contentBounds = rootContent.getBoundingClientRect();
    const containerBounds = rootContentContainer.getBoundingClientRect();
    scrollThumb.style.height = `${Math.ceil((containerBounds.height / contentBounds.height) * 100)}%`;

    const trackBounds = scrollTrack.getBoundingClientRect();
    const ratio = rootContentContainer.scrollTop / contentBounds.height;
    scrollThumb.style.top = `${Math.floor(trackBounds.height * ratio)}px`;
};

rootContentContainer.addEventListener("scroll", () => {
    updateScrollThumb();
});

const cursorAnchor = document.querySelector("#cursor-anchor");
const cursor = document.querySelector("#cursor");
cursor.classList.add("invisible");

setInterval(() => {
    const rootBounds = rootElement.getBoundingClientRect();
    const anchorBounds = cursorAnchor.getBoundingClientRect();
    const cursorBounds = cursor.getBoundingClientRect();

    const scale = Number(document.documentElement.style.getPropertyValue("--scale"));
    cursor.style.top = `${Math.floor(anchorBounds.top - rootBounds.top + (cursorBounds.height * (scale - 0.5)))}px`;
    cursor.style.left = `${Math.floor(anchorBounds.left - rootBounds.left - cursorBounds.width)}px`;

    cursor.classList.remove("invisible");
    const cursorCenter = cursorBounds.top + (cursorBounds.height * 0.5);
    const containerBounds = rootContentContainer.getBoundingClientRect();
    if ((cursorCenter <= containerBounds.top) || (cursorCenter >= containerBounds.bottom)) {
        cursor.classList.add("invisible");
    }
}, 10);

for (const recipe of recipes) {
    if (recipe.id !== "mistake") {
        const extras = [];
        for (const option of recipe.options) {
            if (option.ingredients.length > 1) {
                extras.push({
                    ingredients: [
                        option.ingredients.at(1),
                        option.ingredients.at(0),
                    ],
                    cookbook: option.cookbook,
                    extra: true,
                });
            }
        }
        recipe.options.push(...extras);
    }

    recipe.options.sort((a, b) => (a.ingredients.length - b.ingredients.length)
        || a.ingredients.at(0).name.localeCompare(b.ingredients.at(0).name)
        || a.ingredients.at(1)?.name.localeCompare(b.ingredients.at(1)?.name),
    );
}

const filterList = new Set();
for (const recipe of recipes) {
    filterList.add(recipe.name);
    for (const option of recipe.options) {
        option.ingredients.forEach((ingredient) => filterList.add(ingredient.name));

        const node = recipeNode(recipe, option);
        node.setAttribute("extra", String(option?.extra ?? false));
        rootContent.appendChild(node);
    }
}

const spacer = document.createElement("div");
spacer.classList.add("list-node", "vertical-spacer");
spacer.setAttribute("number", "spacer");
rootContent.appendChild(spacer);

const filterData = document.querySelector("#filter-data");
Array.from(filterList).sort().forEach((filter) => {
    const filterOption = document.createElement("option");
    filterOption.innerText = filter;
    filterData.appendChild(filterOption);
});

const scrollbar = document.querySelector("#scrollbar");

let scrollInterval = undefined;
scrollbar.addEventListener("wheel", (event) => {
    const scrollDirection = Math.sign(event.deltaY);
    const scrollDelta = Math.abs(event.deltaY);
    const scrollAmount = scrollDelta * 0.05;

    clearInterval(scrollInterval);
    let scrollOffset = scrollDelta;
    scrollInterval = setInterval(() => {
        if (scrollOffset < 0) {
            clearInterval(scrollInterval);
            return;
        }

        scrollOffset -= scrollAmount;
        rootContentContainer.scrollTop += scrollDirection * scrollAmount;
        updateScrollThumb();
    }, 10);
});

scrollTrack.addEventListener("mousedown", (event) => {
    scrollTrack.style.cursor = "grabbing";

    const trackBounds = scrollTrack.getBoundingClientRect();
    const thumbBounds = scrollThumb.getBoundingClientRect();

    const thumbOffset = {
        top: thumbBounds.top - trackBounds.top,
        bottom: thumbBounds.bottom - trackBounds.top,
    };
    const offset = event.clientY - trackBounds.top;
    if (offset < thumbOffset.top || offset > thumbOffset.bottom) {
        const delta = (offset - (thumbBounds.height * 0.5)) / trackBounds.height;
        rootContentContainer.scrollTop = rootContentContainer.scrollHeight * Math.min(1, Math.max(0, delta));
        updateScrollThumb();
    }

    const contentBounds = rootContent.getBoundingClientRect();
    const scrollRatio = Math.round(Math.floor(contentBounds.height) / Math.floor(trackBounds.height));
    const scrollDrag = (dragEvent) => {
        rootContentContainer.scrollTop += dragEvent.movementY * scrollRatio;
        updateScrollThumb();
    };

    document.addEventListener("mouseup", () => {
        scrollTrack.style.cursor = null;
        document.removeEventListener("mousemove", scrollDrag);
    });
    document.addEventListener("mousemove", scrollDrag);
});

updateScrollThumb();
