const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllPosts() {
    return await prisma.post.findMany({
      where:{
        published: true,
      },
      select:{
        id:true,
        createdAt:true,
        title:true,
        author:{
          select:{
            username:true,
          }
        },
        authorId:true,
      }
    });
  };
  
async function getByAuthor(authorid) {
  return await prisma.post.findMany({
    where:{
      AND:{
        published:{
          equals: true,
        },
        authorId:{
          equals: Number(authorid),
        }
      }
    },
    select:{
      id:true,
      createdAt:true,
      title:true,
      author:{
        select:{
          username:true,
        }
      },
      authorId:true,
    }
  });
}

async function getPostFromId(id) {
  return await prisma.post.findMany({
    where:{
      AND:{
        published:{
          equals: true,
        },
        id:{
          equals: id,
        },
      }
    },
    select:{
      id:true,
      createdAt:true,
      updatedAt:true,
      title:true,
      content:true,
      author:{
        select:{
          username:true,
        }
      },
      authorId:true,
      comments:{
        select:{
          text: true,
          user:{
            select:{
              username:true,
            }
          }
        }
      },
    }
  });
};

async function createNewPost(req,res,id,bool,authData) {
   await prisma.post.create({
    data: {
      id: id,
      title: req.body.title,
      content: req.body.content,
      authorId: authData.userId,
      published: bool,
    },
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'new post created', 
      postid: id,
    });
  })
  .catch(async (err) => {
    if(err){
      return res.status(400).json({
        err_code: err.code,
        err_meta: err.meta,
      });
    }else{
      await prisma.$disconnect();
      process.exit(1);
    }
  });
  
};

async function updatePost(req,res,postid,bool) {
  await prisma.post.update({
    where:{
      id: postid,
    },
    data: {
      title: req.body.title,
      content: req.body.content,
      published: bool,
    },
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'post successfully updated', 
      postid,
    });
  })
  .catch(async (err) => {
    if(err){
      return res.status(400).json({
        err_code: err.code,
        err_meta: err.meta,
      });
    }else{
      await prisma.$disconnect();
      process.exit(1);
    }
  });
};

async function deletePost(req,res,postid) {
  await prisma.post.delete({
    where:{
      id: postid,
    }
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'post deleted', 
      postid,
    });
  })
  .catch(async (err) => {
    if(err){
      return res.status(400).json({
        err_code: err.code,
        err_meta: err.meta,
      });
    }else{
      await prisma.$disconnect();
      process.exit(1);
    }
  });
};

async function postExists(postid) {
  const post = await prisma.post.findUnique({
    where: {
      id: postid,
    },
  });
  if (post !== null) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
    getAllPosts,
    getByAuthor,
    getPostFromId,
    createNewPost,
    updatePost,
    deletePost,
    postExists,
};
