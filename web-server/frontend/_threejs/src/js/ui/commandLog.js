let current_category_selected = document.querySelectorAll("input[name=cat]");
console.log(current_category_selected);

for (let i = 0; i < current_category_selected.length ;++i){
    current_category_selected[i].addEventListener('click' , (e) => {
        console.log(`selecte value is : ${e.target.value}`);
    })
}