const { withNativeWind: withNativeWind } = require("nativewind/metro");

const { getDefaultConfig } = require("expo/metro-config");
const { withMonicon } = require("@monicon/metro");

const config = getDefaultConfig(__dirname);

const configWithMonicon = withMonicon(config, {
    icons: [
        "simple-icons:actualbudget",
        "arcticons:atrad-stock-trading",
        "iconamoon-home",
        "carbon:location-heart",
        "game-icons:expense",
        "material-symbols:auto-graph",
        "cuida:open-in-new-tab-outline",
        "hugeicons:menu-two-line",
        "bx:dots-vertical-rounded",
        "pepicons-pop:arrow-up",
        "majesticons:microphone-line",
        "cbi:magentatv-alt",
        "streamline:interface-page-controller-button-loop-2-multimedia-multi-button-repeat-media-loop-infinity-controls",
        "ph:plus-circle",
        "stash:arrow-up-solid",
        "tabler:search",
        "material-symbols:edit-outline",
        "simple-icons:openai",
        "mdi:creation",
        "fluent:apps-24-regular",
        "material-symbols:close-small-outline",
        "ph:stop-fill",
        "material-symbols-light:stop-circle-outline-rounded",
        "svg-spinners:270-ring",
        "material-symbols:delete-forever-outline-rounded",
        "material-symbols:cancel-outline-rounded",
        "ph:x-bold",
        "mingcute:stock-line",
        "ph:users-three",
        "hugeicons:blockchain-03",
        "icon-park-outline:blockchain",
        "material-symbols:today",
        "material-symbols:event-available",
        "mingcute:empty-box-line",
        "material-symbols:area-chart-rounded",
        "lucide:chart-candlestick",
        "flowbite:landmark-outline",
        "material-symbols:check-circle-outline",
        "material-symbols:error-outline",
        "material-symbols:info-outline",
        "material-symbols:warning-outline",
        "mdi:form-textbox",
        "mdi:finance",
        "mdi:cash-multiple",
        "mdi:bank",
        "material-symbols:receipt-long-outline",
        "material-symbols:account-balance-outline",
        "material-symbols:trending-up",
        "material-symbols:attach-money",
        "material-symbols:business-center-outline",
        "material-symbols:shopping-cart-outline",
        "material-symbols:save-outline",
        "material-symbols:cancel-outline",
        "material-symbols:add-circle-outline",
        "mdi:plus-circle-outline",
        "mdi:minus-circle-outline",
        "material-symbols:chat-bubble-outline",

    ],
});

const configWithNativeWind = withNativeWind(configWithMonicon, {
    input: "./global.css",
});

module.exports = configWithNativeWind;