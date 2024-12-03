import df from './Dataflow.json';

export function processDataFlow(module, submodule, goals, skills) {
  const data = df;

  if (module === "") {
    return data.dataFlow;
  } else {
    const moduleList = data.dataFlow.find(item => item.title === module);

    if (!moduleList) {
      // console.log("Modulelist not found");
      return null;
    }

    if (submodule === "") {
      return moduleList.item;
    } else {
      const submoduleList = moduleList.item.find(item => item.title === submodule);
      if (!submoduleList) {
        // console.log("Submodulelist not found");
        return null;
      }

      if (goals === "") {
        return submoduleList.item;
      } else {
        const goalList = submoduleList.item.find(item => item.title === goals);
        if (!goalList) {
          // console.log("Goallist not found");
          return null;
        }

        if (skills === "") {
          return goalList.item;
        } else {

          const skillList = goalList.item.find(item => item.title === skills);
          if (!skillList) {
            // console.log("Skilllist not found");
            return null;
          }
          return skillList;
        }
      }
    }
  }
}

export default processDataFlow;


export const getLevelTitle = (title) => {
  return df.dataFlow.find(item => item.title === title);
}

