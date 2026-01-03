let current_category_selected = document.querySelectorAll("input[name=cat]");

console.log(`the length is : ${current_category_selected.length}`);


for (let i = 0; i < current_category_selected.length ;++i){

    current_category_selected[i].addEventListener('click' , (e) => {
        
        console.log(`selecte value is : ${e.target.value}`);
        if (e.target.value == 'all'){

            console.log(`height is : ${document.querySelector('.commandLog').offsetHeight}`)   
            
            let div = document.createElement("div");
            
            div.className = 'command';  

            div.innerText = generate_command_log('12:32:13' , 'information', 'OK' , '128');            
            
            document.querySelector('.commandLog').appendChild(div);
            // auto scroll to the last child 

            document.querySelector('.commandLog').scrollTop = document.querySelector('.commandLog').scrollHeight;
            
            document.querySelector('.alert').classList.add('active');
        }

        if (e.target.value == 'error'){
            document.querySelector('.alert').classList.remove('active');
        }
    })
}

function generate_command_log(date_time , type , status , delay ){
    return `${date_time} : [${type}] : (${status}, ${delay}ms)`
}


