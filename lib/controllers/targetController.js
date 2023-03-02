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
