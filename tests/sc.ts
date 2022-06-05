import {
  web3,
  utils,
  BN,
  Spl,
  AnchorProvider,
  Program,
  workspace,
  setProvider,
} from "@project-serum/anchor";
import { Sc } from "../target/types/sc";
import { initializeAccount, initializeMint } from "./pretest";

describe("sc", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);
  // Program
  const program = workspace.Sc as Program<Sc>;
  console.log(program.programId.toString());
  const splProgram = Spl.token();
  // Context
  const candidate = new web3.Keypair();
  let treasurer: web3.PublicKey;
  let adminTreasurer: web3.PublicKey;
  const mint = new web3.Keypair();
  const admin = new web3.Keypair();
  let candidateTokenAccount: web3.PublicKey;

  let walletTokenAccount: web3.PublicKey;
  let ballot: web3.PublicKey;
  console.log(candidate.publicKey.toString());

  before(async () => {
    // Init a mint
    await initializeMint(9, mint, provider);
    // Derive treasurer account
    const [treasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("treasurer"), candidate.publicKey.toBuffer()],
      program.programId
    );
    treasurer = treasurerPublicKey;
    const [adminTreasurerPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("adminTreasurer"), admin.publicKey.toBuffer()],
      program.programId
    );
    adminTreasurer = adminTreasurerPublicKey;
    const [ballotPublicKey] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("ballot"),
        candidate.publicKey.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    ballot = ballotPublicKey;

    // Derive token account
    walletTokenAccount = await utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: provider.wallet.publicKey,
    });
    candidateTokenAccount = await utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: treasurerPublicKey,
    });

    // Create Token account + Mint to token
    await initializeAccount(
      walletTokenAccount,
      mint.publicKey,
      provider.wallet.publicKey,
      provider
    );
    await splProgram.rpc.mintTo(new BN(1_000_000_000_000), {
      accounts: {
        mint: mint.publicKey,
        to: walletTokenAccount,
        authority: provider.wallet.publicKey,
      },
    });
  });

  it("createAdmin", async () => {
    // Init an admin
    const now = Math.floor(new Date().getTime() / 1000);
    const startTime = new BN(now);
    const endTime = new BN(now + 5);

    await program.rpc.createAdmin(startTime, endTime, {
      accounts: {
        authority: provider.wallet.publicKey,
        admin: admin.publicKey,
        mint: mint.publicKey,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [admin],
    });
  });


  it("initialize candidate", async () => {
    await program.rpc.initializeCandidate({
      accounts: {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer,
        mint: mint.publicKey,
        candidateTokenAccount,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [candidate],
    });
  });

  it("vote", async () => {
    await program.rpc.vote(new BN(1), {
      accounts: {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer,
        admin: admin.publicKey,
        mint: mint.publicKey,
        candidateTokenAccount,
        ballot,
        voterTokenAccount: walletTokenAccount,
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    });
  });

  it("close", async () => {
    setTimeout(async () => {
      await program.rpc.close({
        accounts: {
          authority: provider.wallet.publicKey,
          candidate: candidate.publicKey,
          treasurer,
          admin: admin.publicKey,
          mint: mint.publicKey,
          candidateTokenAccount,
          ballot,
          voterTokenAccount: walletTokenAccount,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      });
    }, 5000);
  });

});
