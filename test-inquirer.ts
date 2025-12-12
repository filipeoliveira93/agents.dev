import inquirer from 'inquirer';

(async () => {
  console.log('Testing inquirer checkbox...');
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targets',
      message: 'Select target formats:',
      choices: [
        { name: 'Gemini CLI', value: 'gemini', checked: true },
        { name: 'Roo Code', value: 'roo', checked: true },
        { name: 'Kilo Code', value: 'kilo', checked: true },
        { name: 'OpenCode', value: 'opencode', checked: true }
      ]
    }
  ]);
  console.log('Selected:', answers.targets);
})();
