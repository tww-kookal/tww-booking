/**
 * Function to render loading dots animation. 
 * @returns {JSX.Element} A loading dots component.
 */
export const LOADING_DOTS = () => (
    <span className="loading-dots">
        <span style={{animationDelay: "0s"}}>.</span>
        <span style={{animationDelay: "0.1s"}}>.</span>
        <span style={{animationDelay: "0.2s"}}>.</span>
    </span>
);
