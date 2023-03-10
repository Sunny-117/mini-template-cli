const { isDirExist } = require('../utils')
const fs = require('fs')
const chalk = require('chalk');
const path = require('path');
var inquirer = require('inquirer');
const axios = require('axios');
const download = require('download-git-repo');
const ora = require('ora');

const { createTemplates } = require('./createTemplates.js')

const create = async (ProjectName) => {
    let isDirExistRes = await isDirExist(ProjectName)
    if (isDirExistRes) {
        console.log(chalk.redBright(`\n项目文件夹 ${ProjectName} 已存在，请更换项目名称\n`));
    } else {
        try {
            const res = await inquirer
                .prompt([
                    {
                        type: 'rawlist',
                        name: 'projectType',
                        message: chalk.yellowBright('请选择'),
                        choices: createTemplates.map(item => item.name)
                    }
                ])
            cloneTemplate(res.projectType, ProjectName);
        } catch (error) {
            if (error.isTtyError) {
                console.error(`Prompt couldn't be rendered in the current environment`)
            } else {
                console.error('Something else went wrong')
            }
        }
    }
}

function cloneTemplate(templateName, descriptionName, ProjectName = 'mini-anything-template') {
    axios.get('https://api.github.com/users/sunny-117/repos').then(res => {
        res.data.forEach(item => {
            if (item.name == templateName) {
                const spinner = ora(`Downloadinging ${templateName}`).start();
                download("direct:" + item.clone_url, ProjectName, { clone: true }, (err) => {
                    spinner.stop();
                    fs.access(path.resolve(process.cwd(), ProjectName), fs.constants.F_OK, (err) => {
                        if (err) {
                            cloneTemplateFailed(ProjectName);
                        } else {
                            fs.readdir(path.resolve(process.cwd(), ProjectName), {
                                encoding: 'utf-8'
                            }, (err, files) => {
                                if (files.length == 0) {
                                    cloneTemplateFailed(ProjectName);
                                } else {
                                    console.log(chalk.greenBright(`\n项目创建成功✨✨\n`));
                                    console.log(chalk.greenBright(`\n1. cd ${ProjectName}\n`));
                                    console.log(chalk.greenBright(`\n2. npm install \n`));
                                    console.log(chalk.greenBright(`\n3. 执行项目启动命令\n`));
                                }
                            })
                        }
                    });
                })
            }
        });
    })
}
async function cloneTemplateFailed(ProjectName) {
    console.log(chalk.redBright(`\n项目创建失败，请检查网络设置并重试\n`));
    const res = await inquirer.prompt({
        type: 'confirm',
        message: '是否重试？',
        name: 'isRetry',
        default: true
    })
    if (res.isRetry) {
        if (isDirExist(ProjectName)) {
            fs.rmdir(path.resolve(process.cwd(), ProjectName), (err) => {
                create(ProjectName);
            })
        }
    } else {
        console.log(`\n你可以检查网络设置后手动重试\n`);
    }
}
function noTemplate(answerName) {
    console.log(`\n暂无 ${chalk.redBright(answerName)} ，请选择其他选项\n`);
}
module.exports = create