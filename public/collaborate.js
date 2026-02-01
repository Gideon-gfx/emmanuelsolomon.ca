let currentTab = 0;
document.addEventListener("DOMContentLoaded", function() {
    showTab(currentTab);
});

function showTab(n) {
  let x = document.getElementsByClassName("form-step");
  for (let i = 0; i < x.length; i++) {
    x[i].classList.add("d-none");
    x[i].classList.remove("active");
  }
  x[n].classList.remove("d-none");
  x[n].classList.add("active");
  
  if (n == 0) {
    document.getElementById("prevBtn").classList.add("d-none");
  } else {
    document.getElementById("prevBtn").classList.remove("d-none");
  }
  
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next Step";
  }
  
  updateProgress(n, x.length);
}

function nextPrev(n) {
  let x = document.getElementsByClassName("form-step");
  if (n == 1 && !validateForm()) return false;
  
  x[currentTab].classList.add("d-none");
  currentTab = currentTab + n;
  
  if (currentTab >= x.length) {
    document.getElementById("collaborationForm").submit();
    return false;
  }
  showTab(currentTab);
}

function validateForm() {
  let x, y, i, valid = true;
  x = document.getElementsByClassName("form-step");
  y = x[currentTab].querySelectorAll("input, select, textarea");

  for (i = 0; i < y.length; i++) {
    if (!y[i].checkValidity()) {
      y[i].classList.add("is-invalid");
      valid = false;
    } else {
       y[i].classList.remove("is-invalid");
    }
  }
  return valid; 
}

function updateProgress(n, total) {
    let progress = ((n + 1) / total) * 100;
    document.getElementById("formProgress").style.width = progress + "%";
}
