const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getByUser(userid) {
  return await prisma.comment.findMany({
    where: {
      userId: Number(userid),
    },
    select: {
      id: true,
      createdAt: true,
      text: true,
      user: {
        select: {
          username: true,
        },
      },
      userId: true,
      postAbout: {
        select: {
          title: true,
        },
      },
    },
  });
}

async function getByUserAndPost(userid, postid) {
  return await prisma.comment.findMany({
      where:{
        AND:{
          userId:{
            equals: Number(userid),
          },
          postAboutId:{
            equals: postid,
          },
        }
      },
      select: {
        id: true,
        createdAt: true,
        text: true,
        user: {
          select: {
            username: true,
          },
        },
        userId: true,
        postAbout: {
          select: {
            title: true,
          },
        },
      },
    });

}

async function getByPost(postid) {
  return await prisma.comment.findMany({
    where:{
      postAboutId: postid,
    },
    select:{
      id: true,
      createdAt: true,
      text: true,
      user: {
        select: {
          username: true,
        },
      },
      userId: true,
      postAbout: {
        select: {
          title: true,
        },
      },
    },
  });
}

async function createComment(req,res,id, postid, authData) {
  await prisma.comment.create({
    data:{
      id: id,
      text: req.body.text,
      userId: authData.userId,
      postAboutId: postid,
    },
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'new comment created', 
      commentid: id,
      postid: postid,
    });
  })
  .catch(async (err) => {
    if(err){
      return res.status(400).json({
        err_code: err.code,
        err_text: 'the key supplied does not exist',
        err_meta: err.meta,
      });
    }else{
      await prisma.$disconnect();
      process.exit(1);
    }
  });
}

async function commentExists(commentid) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentid,
    },
  });
  if (comment !== null) {
    return true;
  } else {
    return false;
  }
};

async function getById(commentid) {
  return prisma.comment.findUnique({
    where:{
      id: commentid,
    },
  });
}

async function updateComment(req, res, commentid) {
  await prisma.comment.update({
    where:{
      id: commentid,
    },
    data:{
      text: req.body.text,
    },
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'comment successfully updated', 
      commentid,
    });
  })
  .catch(
    async (err) => {
      if(err){
        return res.status(400).json({
          err_code: err.code,
          err_meta: err.meta,
        });
      }else{
        await prisma.$disconnect();
        process.exit(1);
      }
    }
  );
}

async function deleteById(req, res, commentid) {
  await prisma.comment.delete({
    where:{
      id: commentid,
    },
  })
  .then(async () => {
    await prisma.$disconnect();
    return res.status(200).json({
      text:'comment deleted', 
      commentid,
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
}

module.exports = {
  getByUser,
  getByUserAndPost,
  getByPost,
  createComment,
  commentExists,
  getById,
  updateComment,
  deleteById,
};
