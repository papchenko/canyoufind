import { motion } from "framer-motion";

const Animation = ({
  children,
  direction = "up",   // up, down, left, right
  duration = 0.8,
  delay = 0,
  stagger = false,
  className = "",
  opposite = false,
  fadeOnly = false,
}) => {

  const getInitial = () => {
    if(fadeOnly) return { opacity: 0 };
    switch(direction) {
      case "up": return { opacity: 0, y: 30 };
      case "down": return { opacity: 0, y: -30 };
      case "left": return { opacity: 0, x: opposite ? 30 : -30 };
      case "right": return { opacity: 0, x: opposite ? -30 : 30 };
      default: return { opacity: 0, y: 30 };
    }
  };

  const sentenceVariant = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1, 
      transition: stagger ? { staggerChildren: 0.05 } : {}
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: fadeOnly ? 0 : 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (stagger && typeof children === "string") {
    return (
      <motion.div
        className={className}
        variants={sentenceVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {children.split("").map((char, i) => (
          <motion.span key={i} variants={letterVariant}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Animation;