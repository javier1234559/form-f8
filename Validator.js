// Đối tượng Validator 
function  Validator(options) {

  function getParent(element,selector){
    while (element.parentElement){
      if(element.parentElement.matches(selector)){
          return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {}; //  tạo 1 object lưu các selector và  tạo array nếu có 1 selector có 2 rules
  //Hàm validate dùng để thực thi
  function invalidate( formElement,rules){ 
      var luat = selectorRules[rules.selector];
      var inputElement = formElement.querySelector(rules.selector);
      var errorMessage;
      
      for(var i = 0 ; i < luat.length ;i++){ // vì là chạy theo index nên để isRequired lên trước
         errorMessage = luat[i](inputElement.value);
        if(errorMessage) break;
      }
          if(errorMessage){ // lưu ý dùng innerText mới có thể xóa đi content thêm vào chứ ko phải innerHTML
            getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector).innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
          }else{
            getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector).innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
          }   
      return !!errorMessage; 
  }
    // Hàm chính của validator
  var formElement = document.querySelector(options.form);
  if(formElement){
    //Khi nhấn submit
    formElement.onsubmit = function (e){
      //Ngăn hành vi mặc định submit của thẻ submit 
        e.preventDefault();
      // Lặp qua các thẻ và validate tất cả
      var isFormValid = true;
      options.rules.forEach((rules)=>{
        var inputElement = formElement.querySelector(rules.selector);
        var isValid =  invalidate(formElement,rules);
        if(!isValid){
            isFormValid = false;
        }
      });
     
      if(!isFormValid){
          if(typeof options.onSubmit == 'function'){
            var enableInputs =  formElement.querySelectorAll('[name]:not([disabled])') // :not([disabled]) dùng để loại đi thẻ disabled
            var formValues = Array.from(enableInputs).reduce(function(value,input){
              value[input.name] = input.value 
              return value; 
            },{}); // tạo 1 một object rỗng
            options.onSubmit (formValues);  // tuyền lại vào mảng 1 object input
          }
      }

    }
    //Khi đang nhập
    options.rules.forEach(function (rules){
      var inputElement = formElement.querySelector(rules.selector);
        
        
        //Object lưu lại các selector có 2 rules trở lên 
        if( Array.isArray(selectorRules[rules.selector])){
          selectorRules[rules.selector].push(rules.test);
        }else{
          selectorRules[rules.selector]= [rules.test];
        }
      if(inputElement){
        // Xử lý khi người dùng blur khỏi input
        inputElement.onblur = function(){
            invalidate(formElement,rules);
        }
        // Xử lý khi người dùng đang nhập input
        inputElement.oninput = function(){
          inputElement.parentElement.querySelector(options.errorSelector).innerText = '';
          inputElement.parentElement.classList.remove('invalid');
   
        }
      }
    });
  }

}

// ĐỊNH NGHĨA RULES 

function isRequired(selector,message){
  return {
    selector : selector,
    test : function(value) {
       return value.trim() ? undefined :  message ||'Vui lòng nhập trường này'  ;
    } 
  }
}
function isEmail(selector,message){
  return {
    selector : selector,
    test : (value) =>{
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message|| 'Trường này phải là email'   ;
    } 
  }
}
function minLength(selector,min,message){
  return {
    selector : selector,
    test : (value) =>{
      return value.length >= min ? undefined : message|| `Vui lòng nhập tối thiểu ${min} kí tự`  ;
    } 
  }
}

function isConfirm(selector,valueConfirm,message){
  return {
    selector : selector,
    test : (value) =>{
      return value === valueConfirm() ? undefined : message|| `Gía trị nhập vào không đúng`  ;
    } 
  }
}

