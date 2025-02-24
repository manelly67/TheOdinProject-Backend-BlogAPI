const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const passwordRequirements =
  "Password must contain at least one number, one uppercase and lowercase letter, one special character, and at least 8 or more characters";

async function createUser(req, res, hashedPassword) {
  await prisma.user
    .create({
      data: {
        email: `${req.body.email}`,
        username: `${req.body.username}`,
        password: `${hashedPassword}`,
        role: req.body.role,
      },
    })
    .then(async () => {
      const userCreated = await getUserFromUsername(req.body.username);
      await prisma.$disconnect();
      res.json({
        text: "user created login in your account",
        user: userCreated,
      });
    })
    .catch(async (err) => {
      if (err.code === "P2002") {
        const errFields = [
          { msg: `fields [ ${err.meta.target}] is already taken.` },
        ];
        return res.status(400).json({
          title: "BLOG | New User",
          user: req.user,
          passwordRequirements: passwordRequirements,
          errors: errFields,
        });
      } else {
        await prisma.$disconnect();
        process.exit(1);
      }
    });
}

const getUserFromUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username: username },
    include: {
      posts: true,
      comments: true,
    },
  });
};

const getUserFromId = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      posts: true,
      comments: true,
    },
  });
};

async function authorExists(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (user !== null && user.role === "AUTHOR") {
    return true;
  } else {
    return false;
  }
}

async function userExists(userid) {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userid),
    },
  });
  if (user !== null) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  createUser,
  getUserFromUsername,
  getUserFromId,
  authorExists,
  userExists,
};
