export const getStartingCharacters = (name, numberOfCharacters = 6) => {
    if (!name) return '';
    if (name.length <= numberOfCharacters) {
        return name;
    } else {
        return name.substring(0, numberOfCharacters);
    }
}