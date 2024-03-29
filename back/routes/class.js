const router = require("express").Router();
const db = require("../models");
const {Class,User,Subject} = db;
const cryptoRandomString = require('crypto-random-string');
const {isLoggedIn,isNotLoggedIn} = require("./middlewares");

// POST /class/subject 과제 만들기
router.post("/subject",isLoggedIn,async (req,res,next)=>{
    try{
        console.log(req.body);

        const {title,classId} = req.body;
        
        await Subject.create({title,classId})

        const subjects = await Subject.findAll({
            where:{
                classId,
            },
            order:[['createdAt', 'DESC']],
        })

        return res.json({
            result:true,
            msg:"과제만들기를 성공했습니다.",
            data:subjects
        });
    } catch(error){
        console.error(error);
        next(error);
    }
});

// POST /class/join 수업 참여하기
router.post("/join",isLoggedIn,async (req,res,next)=>{
    try{
        const {code,userId} = req.body;
        const exClass = await Class.findOne({
            where:{
                code
            }  
        }); 

        if(!exClass){
            return res.json({
                result:false,
                msg:"찾으려는 수업코드가 없습니다.",
            });
        } 

        if(exClass.ownerId === userId){
            return res.json({
                result:false,
                msg:"자신의 수업은 이미 가입이 된 상태입니다.",
            });
        }

        await exClass.addStudent(userId); 
        
        const user = await User.findOne({
            where:{
                id:userId,
            }
        });

        const joinedClass = await user.getJoinedClass({
            include:[
                {
                    model:User,
                    as:"owner",
                    attributes:{
                        exclude:["password","createdAt","updatedAt"],
                    }
                }
            ]
        });

        return res.json({
            result:true,
            msg:"코드에 맞는 수업을 찾았습니다.",
            data:joinedClass,
        });
    } catch(error){
        console.error(error);
        next(error);
    }
});


// POST /class 수업 만들기
router.post("/",isLoggedIn,async (req,res,next)=>{
    try{
        console.log(req.body);
        const {title,description,owner} = req.body;
        let code = cryptoRandomString({length:5});

        const exCode = await Class.findOne({
            where:{
                code
            }
        });

        if(exCode){
            code = cryptoRandomString({length:5});;
        }

        const newClass = await Class.create({
            title,
            description,
            ownerId:owner,
            code,
            click_count:0,
            start_count:0,
        });

        const fullClass = await Class.findAll({
            where:{
                ownerId:owner,
            },
            order:[
                ["createdAt","DESC"],
            ],
            include:[
                {
                    model:User,
                    attributes:{
                        exclude:["password","createdAt","updatedAt"]
                    },
                    as:"owner"
                }
            ]
        });

        return res.json({
            result:true,
            msg:"클래스를 만들었습니다.",
            data:fullClass,
        });

    } catch(error){
        console.error(error);
        next(error);
    }
})

// POST /class/about body:{userId,classId}
router.post("/about",isLoggedIn,async (req,res,next)=>{
    try{
        console.log(req.body);

        const {classId,userId} = req.body;

        const exClass = await Class.findOne({
            where:{
                id:classId,
            },
            include:[
                {
                    model:User,
                    where:{id:userId},
                    as:"owner"
                }
            ]
        });

        const fullClassInfo = await exClass.getSubjects({where:{classId},order:[['createdAt', 'DESC']]});

        res.json({
            result:true,
            msg:"자세한 클래스정보를 찾는데 성공했습니다.",
            data:{
                Class:exClass,
                subjects:fullClassInfo,
            },
        });

    } catch(error){
        console.error(error);
        res.json({
            result:false,
            msg:"자세한 클래스정보를 찾는데 실패했습니다.",
        })
    }
});

module.exports = router;