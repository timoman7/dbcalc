function Main(){
  let D_upgradeInc = document.querySelector('[name="upgradeInc"]');
  let D_tpRequired = document.querySelector('#tpRequired');
  let D_curTP = document.querySelector('[name="curTP"]');
  let D_tpRemaining = document.querySelector('#tpRemaining');
  let D_tpCondition = document.querySelector('#tpCondition');
  // attributes
  // Current
  let C_Str = document.querySelector('[name="C_Str"]');
  let C_Dex = document.querySelector('[name="C_Dex"]');
  let C_Con = document.querySelector('[name="C_Con"]');
  let C_Wil= document.querySelector('[name="C_Wil"]');
  let C_Mnd = document.querySelector('[name="C_Mnd"]');
  let C_Spi = document.querySelector('[name="C_Spi"]');
  // Target
  let D_Str = document.querySelector('[name="Str"]');
  let D_Dex = document.querySelector('[name="Dex"]');
  let D_Con = document.querySelector('[name="Con"]');
  let D_Wil = document.querySelector('[name="Wil"]');
  let D_Mnd = document.querySelector('[name="Mnd"]');
  let D_Spi = document.querySelector('[name="Spi"]');
  //Upgrade Cost
  let D_uc = document.querySelector('#uc');
  let D_MDmg = document.querySelector('[name="MDmg"]');
  let D_Def = document.querySelector('[name="Def"]');
  let D_Bod = document.querySelector('[name="Bod"]');
  let D_Stam = document.querySelector('[name="Stam"]');
  let D_KiP = document.querySelector('[name="KiP"]');
  let D_MKi = document.querySelector('[name="MKi"]');
  let C_MDmg = document.querySelector('[name="C_MDmg"]');
  let C_Def = document.querySelector('[name="C_Def"]');
  let C_Bod = document.querySelector('[name="C_Bod"]');
  let C_Stam= document.querySelector('[name="C_Stam"]');
  let C_KiP = document.querySelector('[name="C_KiP"]');
  let C_MKi = document.querySelector('[name="C_MKi"]');

  let StatArr = [D_Str, D_Dex, D_Con, D_Wil, D_Mnd, D_Spi];
  let C_StatArr = [C_Str, C_Dex, C_Con, C_Wil, C_Mnd, C_Spi];
  let StatSum = 0;
  let T_StatSum = 0;
  let cost = 0;
  function compound(initialTP, currentUC, inc, attAmnt){
    let _cost = 0;
    for(let i = 0; i < attAmnt; i++){
      _cost += currentUC+(inc*(i));
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
    Defense = Dex * 4
      Passive output = Dex * 2
    Body = Con * 20
    Stamina = Con * 3.5
    Ki Power = Wil * 6.2
    Max Ki = Spi * 40
    Running = Dex * ?
    Flying = Dex * ?
   */
  function calculateStats(Str, Dex, Con, Wil, Mnd, Spi){
    let MeleeDamage;
    let Defense;
    let Body;
    let Stamina;
    let KiPower;
    let MaxKi;
    MeleeDamage = Math.ceil(Str * 3.25);
    Defense = {
      Max: Math.ceil(Dex * 4),
      Passive: Math.ceil(Dex * 2)
    };
    Body = Math.ceil(Con * 20);
    Stamina = Math.ceil(Con * 3.5);
    KiPower = Math.ceil(Wil * 6.2);
    MaxKi = Math.ceil(Spi * 40);
    return {
      MeleeDamage: MeleeDamage,
      Defense: Defense,
      Body: Body,
      Stamina: Stamina,
      KiPower: KiPower,
      MaxKi: MaxKi
    };
  }
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
    let info = compound(D_curTP.valueAsNumber, StatSum * D_upgradeInc.valueAsNumber, D_upgradeInc.valueAsNumber, T_StatSum - StatSum);
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
    let curStats = calculateStats(
      C_Str.valueAsNumber,
      C_Dex.valueAsNumber,
      C_Con.valueAsNumber,
      C_Wil.valueAsNumber,
      C_Mnd.valueAsNumber,
      C_Spi.valueAsNumber
    );
    let tarStats = calculateStats(
      D_Str.valueAsNumber,
      D_Dex.valueAsNumber,
      D_Con.valueAsNumber,
      D_Wil.valueAsNumber,
      D_Mnd.valueAsNumber,
      D_Spi.valueAsNumber
    );
    D_MDmg.innerHTML = tarStats.MeleeDamage;
    D_Def.innerHTML = tarStats.Defense.Max+'/'+tarStats.Defense.Passive;
    D_Bod.innerHTML = tarStats.Body;
    D_Stam.innerHTML = tarStats.Stamina;
    D_KiP.innerHTML = tarStats.KiPower;
    D_MKi.innerHTML = tarStats.MaxKi;
    C_MDmg.innerHTML = curStats.MeleeDamage;
    C_Def.innerHTML = curStats.Defense.Max+'/'+curStats.Defense.Passive;
    C_Bod.innerHTML = curStats.Body;
    C_Stam.innerHTML = curStats.Stamina;
    C_KiP.innerHTML = curStats.KiPower;
    C_MKi.innerHTML = curStats.MaxKi;
  }
  StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  C_StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  D_curTP.addEventListener('change', updateStatSum);
  D_upgradeInc.addEventListener('change', updateStatSum);
}

window.onload = Main;
