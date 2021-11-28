function changeVisibility(x){
    document.getElementById("main").classList.add('invisible')
    document.getElementById("more").classList.add('invisible')
    document.getElementById("login").classList.add('invisible')
    document.getElementById(x).classList.remove('invisible')
}