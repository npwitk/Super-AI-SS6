/*
How to use
1. Open the survey page.
2. Right-click → Inspect
3. Go to Console
4. Paste the script and press Enter
*/

document
  .querySelectorAll('input[type="radio"][aria-label="5"]')
  .forEach((radio) => {
    radio.checked = true;
  });

document
  .querySelectorAll('input[type="radio"][aria-label="5"]')
  .forEach((radio) => {
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  });

console.log("All 5s selected");
