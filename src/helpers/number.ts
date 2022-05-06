export function numberWithCommas(x: number) {
    let rounded = x.toFixed(2)
    let parts = rounded.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}