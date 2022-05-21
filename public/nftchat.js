//console.log("will it work")
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', clickHandler);
    main();
  });

  function clickHandler(element) {
      // On click Code
      console.log("you clicked it")
    //   chrome.runtime.sendMessage({ open: true }, (response) => {
    //     //i.src = response;
    //     //p.appendChild(i);
    //     console.log("trying to open the extension")
    //   })
    
      chrome.runtime.sendMessage("iiofaonocipfokmkjlmnafkmalpkdppc", { open: true  },
        response => {
             /* handle the response from background here */
             console.log("trying to open the extension")
        }
    );
  }

  function main() {
      // Initialization work goes here.
  }
  