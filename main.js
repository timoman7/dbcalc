function createTimeline(options, names){
  let tRow = document.querySelector("#currentTargetRow");
  let container;
  if(typeof options.container == "string"){
    container = document.querySelector(options.container);
  }else{
    container = options.container;
  }
  let Current = [];
  let Target = [];
  for(let i = 0; i < names.length; i++){
    let clone = document.importNode(tRow.content, true);
    let current = clone.querySelector("#current");
    let target = clone.querySelector("#target");
    let cEl = document.createElement(options.tag);
    let tEl = document.createElement(options.tag);
    for(let j in options.attributes){
      cEl.setAttribute(j, options.attributes[j]);
      tEl.setAttribute(j, options.attributes[j]);
    }
    if(options.tabIndex){
      cEl.setAttribute('tabIndex', (i+1) + (options.indexStart?options.indexStart:0));
      tEl.setAttribute('tabIndex', (names.length + i+1) + (options.indexStart?options.indexStart:0));
    }
    if(options.innerHTML){
      cEl.innerHTML = options.innerHTML;
      tEl.innerHTML = options.innerHTML;
    }
    let tempN_name = names[i]+"";
    cEl.setAttribute('name', `C_${tempN_name.replace('_','')}`);
    tEl.setAttribute('name', tempN_name.replace('_',''));
    current.appendChild(cEl);
    target.appendChild(tEl);
    let tempName = names[i]+"";
    clone.querySelector("#displayTitle").innerHTML = tempName.replace('_',' ');
    container.appendChild(clone);
    Current.push(cEl);
    Target.push(tEl);
  }
  return {
    Current: Current,
    Target: Target
  };
}
function Main(){
  let D_upgradeInc = document.querySelector('[name="upgradeInc"]');
  let D_tpRequired = document.querySelector('#tpRequired');
  let D_curTP = document.querySelector('[name="curTP"]');
  let D_tpRemaining = document.querySelector('#tpRemaining');
  let D_tpCondition = document.querySelector('#tpCondition');
  let C_level = document.querySelector('#C_level');
  let D_level = document.querySelector('#level');
  //  Upgrade Cost
  let D_uc = document.querySelector('#uc');
  let StatArray = createTimeline({
    container: '#attributes',
    tag: 'input',
    tabIndex: true,
    indexStart: 2,
    attributes: {
      type: 'number',
      min: '0',
      value: '0',
      class: 'stat'
    }
  }, [
    'Str',
    'Dex',
    'Con',
    'Wil',
    'Mnd',
    'Spi'
  ]);
  let EndResults = createTimeline({
    container: '#statistics',
    tag: 'span',
    tabIndex: false,
    attributes: {
      
    },
    innerHTML: '0'
  }, [
    'Melee_Damage',
    'Defense',
    'Body',
    'Stamina',
    'Ki_Power',
    'Max_Ki'
  ]);
  let Skills = createTimeline({
    container: '#skills',
    tag: 'input',
    tabIndex: true,
    indexStart: 14,
    attributes: {
      type: 'number',
      min: '0',
      value: '0',
      class: 'stat'
    }
  }, [
    'Jump',
    'Fly',
    'Meditation',
    'Potential_Unlock',
    'Ki_Protection',
    'Endurance',
    'Ki_Sense',
    'Defense_Penetration',
    'Dash',
    'Ki_Boost',
    'Ki_Fist',
    'Fusion',
    'God_Form',
    'Kaioken'
  ]);
  let StatArr = StatArray.Target;
  let C_StatArr = StatArray.Current;
  let targetResults = EndResults.Target;
  let currentResults = EndResults.Current;
  let StatSum = 0;
  let T_StatSum = 0;
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
    let currentTP = D_curTP.valueAsNumber,
        actualCost= StatSum * D_upgradeInc.valueAsNumber,
        increment = D_upgradeInc.valueAsNumber,
        points    = T_StatSum - StatSum;
    let info = compound(currentTP, actualCost, increment, points);
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
    C_level.innerHTML = Math.floor((StatSum/5)-11);
    D_level.innerHTML = Math.floor((T_StatSum/5)-11);
    let _StatArr = (function(){let r = [];StatArr.forEach(e=>r.push(e.valueAsNumber));return r;})();
    let _C_StatArr = (function(){let r = [];C_StatArr.forEach(e=>r.push(e.valueAsNumber));return r;})();
    let curStats = calculateStats(..._C_StatArr);
    let tarStats = calculateStats(..._StatArr);
    targetResults[0].innerHTML = tarStats.MeleeDamage;
    targetResults[1].innerHTML = tarStats.Defense.Max+'/'+tarStats.Defense.Passive;
    targetResults[2].innerHTML = tarStats.Body;
    targetResults[3].innerHTML = tarStats.Stamina;
    targetResults[4].innerHTML = tarStats.KiPower;
    targetResults[5].innerHTML = tarStats.MaxKi;
    currentResults[0].innerHTML = curStats.MeleeDamage;
    currentResults[1].innerHTML = curStats.Defense.Max+'/'+curStats.Defense.Passive;
    currentResults[2].innerHTML = curStats.Body;
    currentResults[3].innerHTML = curStats.Stamina;
    currentResults[4].innerHTML = curStats.KiPower;
    currentResults[5].innerHTML = curStats.MaxKi;
  }
  StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  C_StatArr.forEach(e=>e.addEventListener('change', updateStatSum));
  D_curTP.addEventListener('change', updateStatSum);
  D_upgradeInc.addEventListener('change', updateStatSum);
}

window.onload = Main;
