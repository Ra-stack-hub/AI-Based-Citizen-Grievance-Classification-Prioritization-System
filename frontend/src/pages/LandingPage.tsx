import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TextSelect, Gauge, CopyX, ImageIcon, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Abstract background gradient/grid (optional) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              NLP • Vision • Priority engine
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-bold text-textPrimary leading-[1.1] tracking-tight mb-6"
            >
              Every citizen <br /> complaint, <br />
              <span className="text-primary">routed in one second.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-textSecondary mb-10 max-w-xl leading-relaxed"
            >
              GrievAI reads the grievance, understands the tone, checks the photo, removes duplicates and hands the right officer a ranked queue — no manual triage desk.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-16"
            >
              <Link to="/submit" className="bg-primary hover:bg-accent text-background font-semibold py-3 px-6 rounded-full transition-colors flex items-center gap-2">
                File a grievance <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/admin" className="bg-surfaceLight hover:bg-surfaceLight/80 text-textPrimary font-medium py-3 px-6 rounded-full transition-colors">
                View control room
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div>
                <div className="text-3xl font-bold text-textPrimary mb-1">1,105</div>
                <div className="text-xs text-textSecondary">Grievances this month</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-textPrimary mb-1">94.2%</div>
                <div className="text-xs text-textSecondary">Routing accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-textPrimary mb-1">3.4 hrs</div>
                <div className="text-xs text-textSecondary">Median first response</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-textPrimary mb-1">18%</div>
                <div className="text-xs text-textSecondary">Filtered as duplicates</div>
              </div>
            </motion.div>
          </div>

          {/* Right side Live Feed */}
          <div className="lg:pl-12">
            <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-textPrimary font-medium">Live triage feed</h3>
                <div className="flex items-center gap-2 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  streaming
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { id: 'GRV-2481', title: 'Huge pothole on Main Street near bus depot', dept: 'Roads & Infrastructure', ward: 'Ward 12', priority: 'Critical', conf: '96%' },
                  { id: 'GRV-2479', title: 'Garbage not collected for 5 days', dept: 'Sanitation & Waste', ward: 'Ward 7', priority: 'High', conf: '93%' },
                  { id: 'GRV-2476', title: 'Street light flickering all night', dept: 'Electricity', ward: 'Ward 3', priority: 'Medium', conf: '88%' },
                  { id: 'GRV-2470', title: 'Muddy water supply since Monday', dept: 'Water Supply', ward: 'Ward 18', priority: 'High', conf: '91%' }
                ].map((ticket, i) => (
                  <Link to="/admin" key={ticket.id} className="block">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="bg-surfaceLight border border-borderLight rounded-xl p-4 hover:bg-surfaceLight/50 transition-colors cursor-pointer"
                    >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-textSecondary font-mono">{(ticket._id || ticket.id)?.substring(0,8)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        ticket.priority === 'Critical' ? 'bg-danger/10 text-danger border border-danger/20' :
                        ticket.priority === 'High' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 className="text-textPrimary text-sm font-medium mb-3 line-clamp-1">{ticket.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-textSecondary">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">{ticket.dept}</span>
                        <span className="flex items-center gap-1">• {ticket.ward}</span>
                      </div>
                      <span className="font-mono">{ticket.conf} conf.</span>
                    </div>
                  </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inside AI Engine */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-textPrimary mb-4">Inside the AI engine</h2>
          <p className="text-textSecondary">Four models run on every submission before a human ever opens the ticket.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 hover:border-borderLight transition-colors">
            <div className="w-10 h-10 rounded-xl bg-surfaceLight flex items-center justify-center mb-6">
              <TextSelect className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-textPrimary font-medium mb-3">Text classification</h3>
            <p className="text-sm text-textSecondary leading-relaxed">Transformer model reads the complaint and picks the right municipal department in under a second.</p>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 hover:border-borderLight transition-colors">
            <div className="w-10 h-10 rounded-xl bg-surfaceLight flex items-center justify-center mb-6">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-textPrimary font-medium mb-3">Priority scoring</h3>
            <p className="text-sm text-textSecondary leading-relaxed">Sentiment, severity keywords and repeat-report volume combine into a Critical → Low score.</p>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 hover:border-borderLight transition-colors">
            <div className="w-10 h-10 rounded-xl bg-surfaceLight flex items-center justify-center mb-6">
              <CopyX className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-textPrimary font-medium mb-3">Duplicate detection</h3>
            <p className="text-sm text-textSecondary leading-relaxed">Sentence embeddings cluster reports about the same issue so officers see one thread, not fifty.</p>
          </div>
          <div className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 hover:border-borderLight transition-colors">
            <div className="w-10 h-10 rounded-xl bg-surfaceLight flex items-center justify-center mb-6">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-textPrimary font-medium mb-3">Image analysis</h3>
            <p className="text-sm text-textSecondary leading-relaxed">Vision model verifies potholes, garbage piles and waterlogging from the attached photo.</p>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-borderLight py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-textSecondary">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <ShieldCheck className="w-4 h-4 text-success" />
            Role-based access for citizens, officers and administrators.
          </div>
          <div>© 2026 GrievAI</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
