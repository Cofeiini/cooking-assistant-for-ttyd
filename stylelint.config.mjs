export default {
    extends: ["stylelint-config-recommended"],
    plugins: [
        "stylelint-order",
    ],
    rules: {
        "order/order": [
            "custom-properties",
            "dollar-variables",
            "at-variables",
            "declarations",
            "at-rules",
            "rules",
        ],
        "order/custom-properties-alphabetical-order": true,
        "order/properties-alphabetical-order": true,
        "no-descending-specificity": null,
    },
};
