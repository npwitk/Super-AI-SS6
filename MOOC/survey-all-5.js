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
    radio.click();
  });

document.querySelectorAll("button.submit").forEach((btn) => {
  btn.disabled = false;
});

console.log("All 5s selected");
