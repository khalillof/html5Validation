

function reg(type:string, _val:any) {
    switch (type) {
        case "postcode":
            return /^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/.test(_val.toUpperCase()) ? "" : "enter a valid UK PostCode";
        case "mobile":
            let number = _val;
            number = number.replace(/\(|\)|\s+|-/g, "");
            //var test = number.length > 9 && number.match(reg.mobile);
            return number.length > 9 && number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[1345789]\d{2}|624)\s?\d{3}\s?\d{3})$/) ? "" : "enter valid UK mobile number";
        case "tel":
            return /^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[1345789]\d{8}|624\d{6})))$/.test(_val) ? "" : "enter valid UK number";
        case "text":
            // /^[a-zA-Z0-9]+$/.test(_val) ? "" : "text and numbers only";
            return /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/.test(_val) ? "" : "text numbers and space only";
        case "textarea":
            return !(/[^A-Za-z0-9 .'?!,@$#-_]/).test(_val) ? "" : "text, numbers & those chars only !,@$#-_ ";
        case "date":
            return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(_val) ? "" : "this format dd/mm/yyyy";
        case "email":
            return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(_val) ? "" : "valid email eg: aa@aa.com";
        case "password":
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,10}/.test(_val) ? "" : "8 to 10 chars 1 uppercase lowercase number and special char";
        default: return "";
        } 
}
function customChecks(elm:any){
    let tagname = elm.tagName.toLowerCase();
    if (tagname === 'input') {        
          elm.setCustomValidity(reg(elm.getAttribute('type')!.toLowerCase(), elm.value));  
      }
      else if (tagname === 'textarea'){
        elm.setCustomValidity(reg(tagname,elm.value));
    }
    else if (tagname === 'file'){
        elm.setCustomValidity(checkfile(elm));
    } 
      
}
function checkedUp(elm:HTMLInputElement, extra=false) {
    extra && customChecks(elm);
    
    if (!elm.validity.valid) {
        let  nxSibling = elm.nextElementSibling;
     if(nxSibling && nxSibling.className.indexOf("invalid-feedback") > -1){
        nxSibling!.innerHTML = elm.validationMessage;
      }else{
          elm.insertAdjacentHTML("afterend", "<div class='invalid-feedback'>" + elm.validationMessage + "</div>")
        }
       
      elm.classList.remove('is-valid');
      elm.classList.add('is-invalid');
    return false;
    } else {

        elm.classList.remove('is-invalid');
        elm.classList.add('is-valid');
        return true;
    }
}

function checkfile(elm:HTMLInputElement, filesNo = 2) {
    let files = elm.files, filength = files!.length, _i = 0, _file:any, fileType: string;

    if (!files || filength === 0) {
        return `doesn't contain any files.`;
    }

    if (filength > filesNo) return `( ${filength} ) files selcted ? only ${filesNo} allowed`;

    for (_i; _i < filength; _i++) {
        _file = elm.files![_i];
        fileType = _file.type;

        if (_file.name.length > 50) return `file : ${_file.name} , is too long`;

       else if ("image/jpeg image/png image/jpg".indexOf(fileType) === -1) return fileType + ":not accepted only jpeg png jpg images";

       else if (_file.size / 1024 / 1024 > 2) return _file.name + ": size is exceeds 2 MB";

    }

    return "";
}

function FormElements(form:HTMLFormElement, extra = false, callback?:Function){

    for (let i = 0; i < form.elements.length; i++){
        let item:any = form.elements[i];
        // check for the submit buton
        if(item.tagName.toLowerCase() !== 'button')
        callback ?  callback(checkedUp(item, extra),item) : checkedUp(item, extra)
    }
}

function processChanges(e:any){
    e.preventDefault();
   checkedUp(e.currentTarget);
  }

var repopulated = false;

  function processForm(e:any){

    e.preventDefault();
    e.stopPropagation();

    let _form: HTMLFormElement = e.target; 
    if(repopulated) {
        FormElements(_form, true);
        console.log('re-populated form pre-checks are done')
    }

    // entry for first form submission
    if (!_form.checkValidity()) {
      console.log(`$form : ${_form.id} submited is not valid`)
      // this check is necessary, just to highlight the required feilds, when submit buton clicked without filling all required feilds
      FormElements(_form);
       
      return;
    }
//============================= when form passed checks now second test inhouse checks
    let inHouseCheckFail = false;
    let itemsValues : {name:string, value:any}[]= [] // store form values in case form will be returned to user, so values are used to populate the form

    FormElements(_form, true, (result:boolean, elm:any)=>{
        if(elm.tagName.toLowerCase() !== 'button'){
        itemsValues.push({name:elm.name, value:elm.value})
        }

        if(!result) { 
        console.log(`${elm.name} : ${elm.value} : this element faild checks after form submission ....!`)
        
        inHouseCheckFail = true; 
        return;
      }
      elm.classList.remove('is-valid')
    })
    
     // if inHouseCheckFail will return form back to user
     if(inHouseCheckFail) {
         _form.reset();
        itemsValues.forEach(item=>{
            
        let ee:any =_form.elements.namedItem(item.name);
        if(item.name === 'Terms'){
            ee.checked = item.value;
        }else{
         ee.value = item.value;
        }
      })
      repopulated = true;
     console.log('in house checks failed, form returned to user')
     return false;
     }

    console.log('form submited is valid & in house checks were done, form will be reseted in 3 seconds ')
    setTimeout(()=> {
        // reset form and variables
        _form.reset();
        inHouseCheckFail = false;
        repopulated = false;
    }, 3000);
    return
  }
  
export {checkedUp, reg, checkfile, processChanges, processForm}

