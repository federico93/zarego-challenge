export const generateRandomString = () => {
    return Math.floor(Math.random() * Date.now()).toString(36);
};
