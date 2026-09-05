import { type RecipeOption, recipes } from "./ts/recipe-data.ts";

const rootContent = document.querySelector<HTMLDivElement>("#root-content")!;
const recipeList = document.querySelector<HTMLDivElement>("#recipe-list")!;

function assertDefined<T>(data: unknown): asserts data is T {
    if ((data === undefined) || (data === null)) {
        throw new Error("Type cast failed!");
    }
}

export const assertType = <T>(data: unknown): T => {
    assertDefined<T>(data);
    return data;
};

const scrollTrack = document.querySelector<HTMLDivElement>("#scrollbar-track")!;
const scrollThumb = document.querySelector<HTMLDivElement>("#scrollbar-thumb")!;

const cursor = document.querySelector<HTMLImageElement>("#cursor")!;
export const updateScrollThumb = (): void => {
    const recipeBounds = recipeList.getBoundingClientRect();
    const contentBounds = rootContent.getBoundingClientRect();

    scrollThumb.style.height = `${Math.ceil((contentBounds.height / recipeBounds.height) * 100)}%`;

    const trackBounds = scrollTrack.getBoundingClientRect();
    const ratio = rootContent.scrollTop / recipeList.offsetHeight;
    scrollThumb.style.top = `${Math.ceil((trackBounds.height) * ratio)}px`;

    const cursorBounds = cursor.getBoundingClientRect();
    const cursorCenter = cursorBounds.top + (cursorBounds.height * 0.5);
    cursor.classList.toggle("invisible", (cursorCenter <= contentBounds.top) || (cursorCenter >= contentBounds.bottom));
};

rootContent.addEventListener("scroll", () => {
    updateScrollThumb();
});

requestAnimationFrame(updateScrollThumb);

document.querySelector<HTMLDivElement>("#scrollbar")!.addEventListener("wheel", (event) => {
    rootContent.scrollBy({
        behavior: "smooth",
        top: event.deltaY,
    });
    rootContent.getBoundingClientRect();
});

scrollTrack.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
        return;
    }

    scrollTrack.style.cursor = "grabbing";

    const trackBounds = scrollTrack.getBoundingClientRect();
    const thumbBounds = scrollThumb.getBoundingClientRect();

    const scrollDrag = (mouse: MouseEvent) => {
        rootContent.scroll({
            behavior: "auto",
            top: recipeList.offsetHeight * (((mouse.clientY - trackBounds.top) - (thumbBounds.height * 0.5)) / trackBounds.height),
        });
    };

    const scrollRelease = () => {
        scrollTrack.style.cursor = "auto";
        document.removeEventListener("mousemove", scrollDrag);
        document.removeEventListener("mouseup", scrollRelease);
    };

    document.addEventListener("mousemove", scrollDrag);
    document.addEventListener("mouseup", scrollRelease);

    rootContent.scroll({
        behavior: "smooth",
        top: recipeList.offsetHeight * (((event.clientY - trackBounds.top) - (thumbBounds.height * 0.5)) / trackBounds.height),
    });
    rootContent.getBoundingClientRect();
});

for (const recipe of recipes) {
    if (recipe.id !== "mistake") {
        const extras = Array<RecipeOption>();
        for (const option of recipe.options) {
            if (option.ingredients.length > 1) {
                extras.push({
                    cookbook: option.cookbook,
                    extra: true,
                    ingredients: [
                        option.ingredients.at(1)!,
                        option.ingredients.at(0)!,
                    ],
                });
            }
        }
        recipe.options.push(...extras);
    }

    recipe.options.sort((a, b): number => {
        return (a.ingredients.length - b.ingredients.length) ||
            a.ingredients.at(0)!.name.localeCompare(b.ingredients.at(0)!.name) ||
            a.ingredients.at(1)!.name.localeCompare(b.ingredients.at(1)!.name);
    });
}

const updateIngredients = () => {
    recipeList.style.setProperty("--ingredient-max-width", "0px");
    let max = 0;
    document.querySelectorAll<HTMLDivElement>(".list-ingredient-item").forEach(item => {
        max = Math.max(max, item.offsetWidth);
    });
    recipeList.style.setProperty("--ingredient-max-width", `${max}px`);
};
requestAnimationFrame(updateIngredients);

window.addEventListener("resize", updateIngredients);
