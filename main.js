function Main(){
  let D_upgradeInc = document.querySelector('[name="upgradeInc"]');
  let D_tpRequired = document.querySelector('#tpRequired');
  let D_curTP = document.querySelector('[name="curTP"]');
  let D_tpRemaining = document.querySelector('#tpRemaining');
  let D_tpCondition = document.querySelector('#tpCondition');
  let D_Str = document.querySelector('[name="Str"]');
  let D_Dex = document.querySelector('[name="Dex"]');
  let D_Con = document.querySelector('[name="Con"]');
  let D_Wil = document.querySelector('[name="Wil"]');
  let D_Mnd = document.querySelector('[name="Mnd"]');
  let D_Spi = document.querySelector('[name="Spi"]');
  let C_Str = document.querySelector('[name="C_Str"]');
  let C_Dex = document.querySelector('[name="C_Dex"]');
  let C_Con = document.querySelector('[name="C_Con"]');
  let C_Wil= document.querySelector('[name="C_Wil"]');
  let C_Mnd = document.querySelector('[name="C_Mnd"]');
  let C_Spi = document.querySelector('[name="C_Spi"]');
  let D_uc = document.querySelector('#uc');
  let StatArr = [D_Str, D_Dex, D_Con, D_Wil, D_Mnd, D_Spi];
  let C_StatArr = [C_Str, C_Dex, C_Con, C_Wil, C_Mnd, C_Spi];
  let StatSum = 0;
  let T_StatSum = 0;
  let cost = 0;
  function compound(initialTP, currentUC, inc, attAmnt){
    let _cost = 0;
    for(let i = 0; i < attAmnt; i++){
      _cost += currentUC+(inc*(i+1));
    }
    return {
      leftover: initialTP - _cost,
      cost: _cost
    };
  }
  // COMBAK: CALCULATE STAT MULTIPLIERS
  /*
    Multipliers:
    Melee Damage = Str * 3.25

   */
  function updateStatSum(){
    StatSum = 0;
    T_StatSum = 0;
    C_StatArr.forEach((e)=>{
      StatSum += e.valueAsNumber;
    });
    StatArr.forEach((e)=>{
      e.setAttribute('min', C_StatArr[StatArr.indexOf(e)].valueAsNumber);
      if(e.valueAsNumber < parseFloat(e.getAttribute('min'))){
        e.value = parseFloat(e.getAttribute('min'));
      }
      T_StatSum += e.valueAsNumber;
    });
    let newUC = T_StatSum * D_upgradeInc.valueAsNumber;
    D_uc.innerHTML = newUC;
    cost = 0;
    let info = compound(D_curTP.valueAsNumber, newUC, D_upgradeInc.valueAsNumber, T_StatSum - StatSum);
    D_tpRequired.innerHTML = info.cost;
    if(info.leftover == 0){
      D_tpCondition.innerHTML = "Remaining TP:";
      D_tpRemaining.innerHTML = 'None';
    }else if(info.leftover < 0){
      D_tpCondition.innerHTML = "Not enough TP! Requires";
      D_tpRemaining.innerHTML = Math.abs(info.leftover) + " more!";
    }else if(info.leftover > 0){
      D_tpCondition.innerHTML = "Remaining TP:";
      D_tpRemaining.innerHTML = info.leftover;
    }
  }
  StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  C_StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  D_curTP.addEventListener('change', updateStatSum);
  D_upgradeInc.addEventListener('change', updateStatSum);
}

window.onload = Main;
