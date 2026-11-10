export type AnalysisLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Critique {
  strengths: string[];
  weaknesses: string[];
  open_questions: string[];
}

export interface PaperAnalysisResult {
  title: string;
  one_line_summary: string;
  problem: string;
  method: string;
  key_results: string[];
  critique: Critique;
}

export interface SamplePaper {
  id: string;
  title: string;
  tag: string;
  level: AnalysisLevel;
  abstract: string;
}

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: 'plant-disease',
    title: 'Mobile Plant Disease Classification',
    tag: 'Computer Vision & Agriculture',
    level: 'Beginner',
    abstract: `We propose a lightweight convolutional network for classifying plant leaf diseases on mobile devices. Our model achieves 94.1% accuracy on the PlantVillage dataset with 1.2M parameters, 8x smaller than ResNet-50. We note that all images were captured under controlled lighting, and field performance was not evaluated.`,
  },
  {
    id: 'attention-transformer',
    title: 'Attention Is All You Need',
    tag: 'NLP & Deep Learning',
    level: 'Intermediate',
    abstract: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.`,
  },
  {
    id: 'crispr-cas9',
    title: 'Programmable Dual-RNA-Guided DNA Cleavage (CRISPR)',
    tag: 'Genetics & Biochemistry',
    level: 'Beginner',
    abstract: `Clustered regularly interspaced short palindromic repeats (CRISPR)/CRISPR-associated (Cas) systems provide bacteria and archaea with adaptive immunity against viruses and plasmids by using RNA to direct the degradation of foreign nucleic acids. In the type II CRISPR/Cas system of Streptococcus pyogenes, Cas9 functions as an endonuclease that requires dual RNA molecules—a mature CRISPR RNA (crRNA) and a trans-activating crRNA (tracrRNA)—to recognize and cleave target DNA. We show that the Cas9 endonuclease can be programmed with single guide RNAs engineered to mimic the dual-tracrRNA:crRNA structure. This programmable dual-RNA-guided system enables sequence-specific site-directed double-strand DNA cleavage and holds potential for targeted genome editing in eukaryotic cells.`,
  },
  {
    id: 'resnet',
    title: 'Deep Residual Learning for Image Recognition',
    tag: 'Deep Neural Networks',
    level: 'Advanced',
    abstract: `Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task. We also present analysis on CIFAR-10 with 100 and 1000 layers.`,
  },
];
