import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Globe, Zap } from 'lucide-react';

const About = () => {
  const highlights = [
    {
      icon: Code,
      title: 'Full Stack Development',
      description: 'Expert in modern web technologies including React, Node.js, and cloud platforms.'
    },
    {
      icon: Database,
      title: 'Database Design',
      description: 'Proficient in SQL and NoSQL databases with focus on scalability and performance.'
    },
    {
      icon: Globe,
      title: 'Web Architecture',
      description: 'Building robust, scalable applications with microservices and serverless architectures.'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Optimizing applications for speed, accessibility, and exceptional user experience.'
    }
  ];

  return (
    <section className="min-h-screen py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            About <span className="text-amber-400">Me</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Passionate full-stack developer with 5+ years of experience creating 
            innovative solutions that bridge the gap between design and functionality.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-white">My Journey</h3>
              <div className="space-y-4 text-gray-300">
                <p>
                  Started my journey in computer science with a fascination for problem-solving
                  and creating digital solutions. Over the years, I've evolved from writing
                  simple scripts to architecting complex, scalable applications.
                </p>
                <p>
                  My expertise spans the entire development stack, from crafting intuitive
                  user interfaces to designing robust backend systems. I believe in writing
                  clean, maintainable code and following industry best practices.
                </p>
                <p>
                  Currently focused on modern web technologies, cloud computing, and 
                  emerging trends in software development. Always eager to learn and 
                  adapt to new technologies.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 rounded-xl p-6 border border-blue-500/30">
              <h4 className="text-lg font-semibold text-white mb-2">Education</h4>
              <p className="text-gray-300">M.S. Computer Science</p>
              <p className="text-sm text-gray-400">University of Technology • 2019-2021</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
              <h4 className="text-lg font-semibold text-white mb-2">Experience</h4>
              <p className="text-gray-300">Senior Full Stack Developer</p>
              <p className="text-sm text-gray-400">Tech Solutions Inc. • 2021-Present</p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-6 border border-amber-500/30">
              <h4 className="text-lg font-semibold text-white mb-2">Certifications</h4>
              <p className="text-gray-300">AWS Solutions Architect</p>
              <p className="text-sm text-gray-400">Google Cloud Professional Developer</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            What I Bring to the Table
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{item.title}</h4>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;