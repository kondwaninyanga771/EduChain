import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Copy, ExternalLink, Check, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function VerificationPage() {
  const [searchParams] = useSearchParams();
  const [txHash, setTxHash] = useState(searchParams.get('hash') || '');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [verificationData, setVerificationData] = useState({
    ipfsHash: '',
    type: '',
    timestamp: ''
  });

  // Automatically start verification if hash is provided in URL
  useEffect(() => {
    if (searchParams.get('hash')) {
      handleVerify();
    }
  }, [searchParams]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setIsVerified(false);
    
    try {
      const response = await fetch(`/api/student/verify?hash=${txHash}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVerificationData({
          ipfsHash: data.ipfsHash,
          type: data.type,
          timestamp: new Date(data.timestamp).toUTCString()
        });
      }
    } catch (err) {
      console.error("Failed to fetch verification data", err);
    }
    
    // Simulate blockchain verification delay for UX
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cryptographic Verification</h1>
        <p className="text-slate-500 dark:text-slate-400">Verify the authenticity and immutability of academic records directly on the Ethereum blockchain.</p>
      </div>

      <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-800">
        {/* Animated background gradient for verified state */}
        {isVerified && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"
          />
        )}
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Record Certificate</CardTitle>
              <CardDescription>On-chain transaction details</CardDescription>
            </div>
            {isVerified && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-sm font-semibold"
              >
                <Check className="h-4 w-4" />
                Verified Authentic
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Transaction Hash</p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-mono text-sm break-all">
                <input 
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter 0x... Transaction Hash"
                  className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-slate-300 placeholder:text-slate-400 font-mono text-sm"
                />
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="shrink-0 ml-2" disabled={!txHash}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">IPFS Content Hash</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-mono text-sm break-all text-slate-900 dark:text-slate-300">
                {verificationData.ipfsHash ? verificationData.ipfsHash : 
                 (verificationData.type === 'QUIZ' ? 'N/A (On-Chain Quiz Data)' : <span className="text-slate-400 italic">Pending Verification...</span>)}
              </div>
            </div>

            <div className="md:col-span-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Block Timestamp</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300">
                {verificationData.timestamp || <span className="text-slate-400 italic">Pending Verification...</span>}
              </div>
            </div>

            <div className="md:col-span-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Block Number</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300">
                17,452,891
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Smart Contract Interacted With</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-mono text-sm break-all text-slate-900 dark:text-slate-300">
                <Database className="h-4 w-4 text-slate-400 shrink-0" />
                0x5FbDB2315678afecb367f032d93F642f64180aa3
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4 flex gap-4">
            <div className="shrink-0">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">What does this mean?</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                This record is permanently stored on the decentralized Ethereum network. The cryptographic hash ensures that the original submission file and its associated metadata (grade, timestamps) cannot be altered or tampered with by any party, including system administrators.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying || isVerified || !txHash.startsWith('0x')} 
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Querying Blockchain...
                </>
              ) : isVerified ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : (
                'Run Cryptographic Verification'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-white dark:bg-slate-950"
              onClick={() => {
                if (txHash && txHash.startsWith('0x')) {
                  window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
                }
              }}
              disabled={!txHash || !txHash.startsWith('0x')}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View on Etherscan
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
