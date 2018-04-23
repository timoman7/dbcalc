let lazyList = {
  'more-info': {
    'title': 'Not enough data to calculate properly'
  }
};
function saveData(_json_){
  let jsonse = JSON.stringify(_json_);
  let blob = new Blob([jsonse], {type: "application/json"});
  let url  = URL.createObjectURL(blob);
  let _a = document.createElement('a');
  _a.href        = url;
  _a.download    = "character.json";
  _a.textContent = "Download character.json";
  _a.click();
}
function setView(viewN){
  document.querySelectorAll('.view').forEach((e,i)=>{
    if(i != viewN){
      e.classList.add('view-inactive');
      e.classList.remove('view-active');
    }else{
      e.classList.remove('view-inactive');
      e.classList.add('view-active');
    }
  });
}
function wildContains(list, check){
  let rv = {
    success: false,
    attr: []
  };
  for(let ind in list){
    let kv = list[ind];
    if(check.contains(kv)){
      rv.success = true;
      rv.attr.push(kv);
    }else{
      return {
        success: false,
        attr: []
      };
    }
  }
  return rv;
}
function modifyDOMClasses(modList){
  document.querySelectorAll('*').forEach((e)=>{
    let DOMStuff = wildContains(Object.keys(modList), e.classList);
    if(DOMStuff.success){
      DOMStuff.attr.forEach((a)=>{
        for(let attrKN in modList[a]){
          e.setAttribute(attrKN, modList[a][attrKN]);
        }
      });
    }
  });
};
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
    if(options.tag.toLowerCase() == 'input'){
      cEl.addEventListener('change', (e)=>{
        tEl.setAttribute('min', cEl.valueAsNumber);
        if(tEl.valueAsNumber < parseFloat(tEl.getAttribute('min'))){
          tEl.value = parseFloat(tEl.getAttribute('min'));
        }
      });
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
  let C_saveChar = document.querySelector('#saveChar');
  let C_charName = document.querySelector('#charName'),
      C_charClass = document.querySelector('#charClass'),
      C_charRace = document.querySelector('#charRace'),
      C_charGender = document.querySelector('#charGender'),
      C_charAge = document.querySelector('#charAge');
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
      class: 'stat',
      title: 'Need more info on multipliers to calculate properly.'
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
    // StatArr.forEach((e)=>{
    //   e.setAttribute('min', C_StatArr[StatArr.indexOf(e)].valueAsNumber);
    //   if(e.valueAsNumber < parseFloat(e.getAttribute('min'))){
    //     e.value = parseFloat(e.getAttribute('min'));
    //   }
    //   T_StatSum += e.valueAsNumber;
    // });
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
  modifyDOMClasses(lazyList);
  setView(0);
  C_saveChar.addEventListener('click', function(){
    let characterData = {
      Attributes: {
        Current: {
          Str: C_StatArr[0].valueAsNumber,
          Dex: C_StatArr[1].valueAsNumber,
          Con: C_StatArr[2].valueAsNumber,
          Wil: C_StatArr[3].valueAsNumber,
          Mnd: C_StatArr[4].valueAsNumber,
          Spi: C_StatArr[5].valueAsNumber
        },
        Target: {
          Str: StatArr[0].valueAsNumber,
          Dex: StatArr[1].valueAsNumber,
          Con: StatArr[2].valueAsNumber,
          Wil: StatArr[3].valueAsNumber,
          Mnd: StatArr[4].valueAsNumber,
          Spi: StatArr[5].valueAsNumber
        }
      },
      Skills: {
        Current: {
          Jump: Skills.Current[0].valueAsNumber,
          Fly: Skills.Current[1].valueAsNumber,
          Meditation: Skills.Current[2].valueAsNumber,
          Potential_Unlock: Skills.Current[3].valueAsNumber,
          Ki_Protection: Skills.Current[4].valueAsNumber,
          Endurance: Skills.Current[5].valueAsNumber,
          Ki_Sense: Skills.Current[6].valueAsNumber,
          Defense_Penetration: Skills.Current[7].valueAsNumber,
          Dash: Skills.Current[8].valueAsNumber,
          Ki_Boost: Skills.Current[9].valueAsNumber,
          Ki_Fist: Skills.Current[10].valueAsNumber,
          Fusion: Skills.Current[11].valueAsNumber,
          God_Form: Skills.Current[12].valueAsNumber,
          Kaioken: Skills.Current[13].valueAsNumber
        },
        Target: {
          Jump: Skills.Target[0].valueAsNumber,
          Fly: Skills.Target[1].valueAsNumber,
          Meditation: Skills.Target[2].valueAsNumber,
          Potential_Unlock: Skills.Target[3].valueAsNumber,
          Ki_Protection: Skills.Target[4].valueAsNumber,
          Endurance: Skills.Target[5].valueAsNumber,
          Ki_Sense: Skills.Target[6].valueAsNumber,
          Defense_Penetration: Skills.Target[7].valueAsNumber,
          Dash: Skills.Target[8].valueAsNumber,
          Ki_Boost: Skills.Target[9].valueAsNumber,
          Ki_Fist: Skills.Target[10].valueAsNumber,
          Fusion: Skills.Target[11].valueAsNumber,
          God_Form: Skills.Target[12].valueAsNumber,
          Kaioken: Skills.Target[13].valueAsNumber
        }
      },
      Statistics: {
        Current: {
          Melee_Damage: targetResults[0].innerHTML,
          Defense: {
            Max: targetResults[1].innerHTML.split('/')[0],
            Passive: targetResults[1].innerHTML.split('/')[1] || targetResults[1].innerHTML.split('/')[0]
          },
          Body: targetResults[2].innerHTML,
          Stamina: targetResults[3].innerHTML,
          Ki_Power: targetResults[4].innerHTML,
          Max_Ki: targetResults[5].innerHTML,
        },
        Target: {
          Melee_Damage: currentResults[0].innerHTML,
          Defense: {
            Max: currentResults[1].innerHTML.split('/')[0],
            Passive: currentResults[1].innerHTML.split('/')[1] || currentResults[1].innerHTML.split('/')[0]
          },
          Body: currentResults[2].innerHTML,
          Stamina: currentResults[3].innerHTML,
          Ki_Power: currentResults[4].innerHTML,
          Max_Ki: currentResults[5].innerHTML,
        }
      },
      Character: {
        Name: C_charName.value,
        Class: C_charClass.value,
        Race: C_charRace.value,
        Gender: C_charGender.value,
        Age: C_charAge.value
      },
      CurrentTP: D_curTP.valueAsNumber
    };
    saveData(characterData);
  });
}

window.onload = Main;
