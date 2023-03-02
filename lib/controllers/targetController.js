var redis = require("../redis");

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTargetById,
  makeingDecision,
};

function createTarget(req, res, opt) {
  console.log("opt");
  console.log(opt)

}
function getAllTargets(req, res, opt)  {
  console.log("getAllTargets");
};
function getTargetById (req, res, opt) {
  console.log("getTargetById");
};
function updateTargetById (req, res, opt) {
  console.log("updateTargetById");
};
function makeingDecision (req, res, opt) {
  console.log("makeingDecision");
};


function createTargets(key, targetId, data) {
  return new Promise((resolve, reject) => {
    redis.hset(key, targetId, JSON.stringify(data), (err, result) => {
      if (err) return reject(err);
      if (!result) return reject({ message: "Target created before" });
      return resolve({
        target: JSON.parse(result),
        message: "Target created successfully",
      });
    });
  });
}
