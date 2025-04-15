

const validate = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(422).json({
        error: "Validation Error",
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

export default validate;
